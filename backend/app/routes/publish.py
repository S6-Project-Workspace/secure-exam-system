from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.routes.auth import get_current_user
from app.db import supabase
from datetime import datetime
import base64
import json

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey


class PublishExamRequest(BaseModel):
    exam_id: str
    encrypted_mcqs: str  # base64 ciphertext (includes GCM tag)
    iv: str              # base64 IV used for AES-GCM
    signature: str       # base64 RSA-PSS signature over ciphertext
    aes_key: str         # base64 raw AES-256 key


router = APIRouter(prefix="/publish", tags=["Publish"])


@router.post("/exam")
def publish_exam(payload: PublishExamRequest, user=Depends(get_current_user)):
    # 1. Only instructors allowed
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can publish exams")

    instructor_id = user["sub"]

    exam_id = payload.exam_id

    # 2. Verify instructor owns exam
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="Not your exam")

    # 3. Verify instructor signature
    key_row = supabase.table("public_keys").select("public_key").eq("user_id", instructor_id).execute()
    if not key_row.data:
        raise HTTPException(status_code=400, detail="Instructor public key missing")

    stored_key = key_row.data[0]["public_key"]
    
    # Handle both JSON format (with oaep/pss keys) and plain PEM format
    try:
        key_data = json.loads(stored_key)
        # JSON format: extract the PSS key for signing verification
        pss_pem = key_data.get("pss")
        if not pss_pem:
            raise HTTPException(status_code=400, detail="PSS public key not found in stored keys")
        pub_pem = pss_pem.encode()
    except json.JSONDecodeError:
        # Plain PEM format (backwards compatibility)
        pub_pem = stored_key.encode()
    
    try:
        pub_key = load_pem_public_key(pub_pem)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid stored public key: {e}")

    # Ensure instructor public key is RSA and at least 2048 bits
    if not isinstance(pub_key, RSAPublicKey) or getattr(pub_key, "key_size", 0) < 2048:
        raise HTTPException(status_code=400, detail="Instructor public key is invalid or too weak")

    ciphertext = base64.b64decode(payload.encrypted_mcqs)
    sig = base64.b64decode(payload.signature)

    try:
        pub_key.verify(
            sig,
            ciphertext,
            asym_padding.PSS(
                mgf=asym_padding.MGF1(hashes.SHA256()),
                salt_length=32  # Must match Web Crypto API saltLength: 32
            ),
            hashes.SHA256()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    # 4. Store encrypted MCQ package (server never sees plaintext)
    # AES-GCM tag is the last 16 bytes of the ciphertext (appended by Web Crypto API)
    ciphertext_with_tag = base64.b64decode(payload.encrypted_mcqs)
    if len(ciphertext_with_tag) < 16:
        raise HTTPException(status_code=400, detail="Invalid ciphertext - too short for GCM tag")
    
    # Extract tag (last 16 bytes) and ciphertext (rest)
    gcm_tag = ciphertext_with_tag[-16:]
    pure_ciphertext = ciphertext_with_tag[:-16]
    
    try:
        result = supabase.table("exam_packages").insert({
            "exam_id": exam_id,
            "encrypted_mcqs": base64.b64encode(pure_ciphertext).decode(),
            "iv": payload.iv,
            "tag": base64.b64encode(gcm_tag).decode(),
            "signature": payload.signature,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store exam package: {e}")

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to store exam package - no data returned")

    package_id = result.data[0].get("package_id") or result.data[0].get("id")

    # 5. Wrap AES key for each student using RSA-OAEP and store
    try:
        k_exam = base64.b64decode(payload.aes_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid AES key encoding")

    # Validate AES-256 key length (32 bytes)
    if len(k_exam) != 32:
        raise HTTPException(status_code=400, detail="Invalid AES key length; expected 32 bytes")

    # Fetch all students
    students = supabase.table("users").select("id").eq("role", "student").execute()
    student_ids = [s["id"] for s in (students.data or [])]

    for sid in student_ids:
        rec = supabase.table("public_keys").select("public_key").eq("user_id", sid).execute()
        if not rec.data:
            continue

        # Handle both JSON format and plain PEM format for student keys
        student_stored_key = rec.data[0]["public_key"]
        try:
            student_key_data = json.loads(student_stored_key)
            # JSON format: extract the OAEP key for encryption
            student_oaep_pem = student_key_data.get("oaep")
            if not student_oaep_pem:
                continue
            student_pub_pem = student_oaep_pem.encode()
        except json.JSONDecodeError:
            # Plain PEM format
            student_pub_pem = student_stored_key.encode()
        
        try:
            student_pub = load_pem_public_key(student_pub_pem)
        except Exception:
            # invalid stored key, skip
            continue

        # Ensure student public key is RSA and sufficiently strong
        if not isinstance(student_pub, RSAPublicKey) or getattr(student_pub, "key_size", 0) < 2048:
            continue

        try:
            wrapped = student_pub.encrypt(
                k_exam,
                asym_padding.OAEP(
                    mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            wrapped_b64 = base64.b64encode(wrapped).decode()

            supabase.table("exam_keys").insert({
                "package_id": package_id,
                "exam_id": exam_id,
                "student_id": sid,
                "wrapped_key": wrapped_b64
            }).execute()
        except Exception:
            # Skip if encryption fails for this student
            continue

    # 6. Audit Log
    supabase.table("audit_logs").insert({
        "user_id": instructor_id,
        "event_type": "publish_exam",
        "event_details": f"Published exam {exam_id}",
        "timestamp": datetime.utcnow().isoformat()
    }).execute()

    return {"message": "Exam published", "package_id": package_id}
