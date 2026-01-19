from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.routes.auth import get_current_user
from app.db import supabase
from datetime import datetime
import base64

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key


router = APIRouter(prefix="/submissions", tags=["Submissions"])


class SubmissionPayload(BaseModel):
    exam_id: str
    encrypted_answers: str  # base64
    iv: str                 # base64
    encrypted_aes_key: str  # base64 (wrapped for instructor)
    student_signature: str  # base64 signature over hash
    hash: str               # base64 SHA-256 hash of plaintext answers


@router.post("")
def submit_answers(payload: SubmissionPayload, user=Depends(get_current_user)):
    # Only students may submit
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can submit answers")

    student_id = user.get("sub")

    # Fetch student's public key
    rec = supabase.table("public_keys").select("public_key").eq("user_id", student_id).execute()
    if not rec.data:
        raise HTTPException(status_code=400, detail="Student public key missing")

    stored = rec.data[0]["public_key"]

    # stored may be a JSON string containing multiple keys (oaep/pss) or a PEM string
    pss_pem = None
    try:
        # detect JSON
        if isinstance(stored, str) and stored.strip().startswith("{"):
            import json

            parsed = json.loads(stored)
            pss_pem = parsed.get("pss") or parsed.get("pss_public")
        else:
            pss_pem = stored
    except Exception:
        pss_pem = stored

    if not pss_pem:
        raise HTTPException(status_code=400, detail="Student signing public key missing")

    try:
        pub_key = load_pem_public_key(pss_pem.encode())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid stored student public key: {e}")

    # Verify signature over provided hash
    try:
        sig = base64.b64decode(payload.student_signature)
        hash_bytes = base64.b64decode(payload.hash)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 in signature or hash")

    try:
        pub_key.verify(
            sig,
            hash_bytes,
            asym_padding.PSS(
                mgf=asym_padding.MGF1(hashes.SHA256()),
                salt_length=32,  # Match Web Crypto API saltLength: 32
            ),
            hashes.SHA256(),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    # Basic validation of fields (lengths, base64 correctness)
    try:
        _ = base64.b64decode(payload.encrypted_answers)
        iv_bytes = base64.b64decode(payload.iv)
        _ = base64.b64decode(payload.encrypted_aes_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 in submission fields")

    if len(iv_bytes) != 12:
        raise HTTPException(status_code=400, detail="Invalid IV length; expected 12 bytes for AES-GCM")

    # At this point signature validated; server stores only encrypted data
    res = supabase.table("submissions").insert({
        "exam_id": payload.exam_id,
        "student_id": student_id,
        "encrypted_answers": payload.encrypted_answers,
        "iv": payload.iv,
        "student_signature": payload.student_signature,
        "hash": payload.hash,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to store submission")

    submission_id = res.data[0].get("submission_id") or res.data[0].get("id")

    # Store wrapped AES key for instructor (so instructor can later decrypt)
    try:
        supabase.table("submission_keys").insert({
            "submission_id": submission_id,
            "exam_id": payload.exam_id,
            "student_id": student_id,
            "wrapped_key": payload.encrypted_aes_key,
        }).execute()
    except Exception:
        # don't leak details; submission already stored
        pass

    # Audit log
    supabase.table("audit_logs").insert({
        "user_id": student_id,
        "event_type": "submit_exam",
        "event_details": f"Submitted answers for exam {payload.exam_id}",
        "timestamp": datetime.utcnow().isoformat(),
    }).execute()

    return {"message": "Submission recorded", "submission_id": submission_id}
