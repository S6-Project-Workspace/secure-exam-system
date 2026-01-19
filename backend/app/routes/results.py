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


class PublishResultRequest(BaseModel):
    exam_id: str
    student_id: str
    marks: float
    feedback: str = None
    evaluated_at: str
    instructor_signature: str  # base64 signature over canonical result JSON


router = APIRouter(prefix="/results", tags=["Results"])


@router.post("/publish")
def publish_result(payload: PublishResultRequest, user=Depends(get_current_user)):
    # Only instructors may publish results
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can publish results")

    instructor_id = user.get("sub")

    # Verify instructor owns exam
    exam = supabase.table("exams").select("*").eq("exam_id", payload.exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized for this exam")

    # Load instructor public key
    key_row = supabase.table("public_keys").select("public_key").eq("user_id", instructor_id).execute()
    if not key_row.data:
        raise HTTPException(status_code=400, detail="Instructor public key missing")

    stored_key = key_row.data[0]["public_key"]
    
    # Handle JSON format (with oaep/pss keys)
    try:
        key_data = json.loads(stored_key)
        pss_pem = key_data.get("pss")
        if not pss_pem:
            raise HTTPException(status_code=400, detail="PSS public key not found")
        pub_pem = pss_pem.encode()
    except json.JSONDecodeError:
        pub_pem = stored_key.encode()

    try:
        pub_key = load_pem_public_key(pub_pem)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid stored public key: {e}")

    if not isinstance(pub_key, RSAPublicKey) or getattr(pub_key, "key_size", 0) < 2048:
        raise HTTPException(status_code=400, detail="Instructor public key is invalid or too weak")

    # Re-create canonical result JSON to verify signature
    result_obj = {
        "exam_id": payload.exam_id,
        "student_id": payload.student_id,
        "marks": payload.marks,
        "evaluated_at": payload.evaluated_at,
    }

    # Canonical JSON: sorted keys, compact separators. Frontend must use same canonicalization.
    canonical = json.dumps(result_obj, separators=(",", ":"), sort_keys=True).encode()

    try:
        sig = base64.b64decode(payload.instructor_signature)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 in signature")

    try:
        pub_key.verify(
            sig,
            canonical,
            asym_padding.PSS(
                mgf=asym_padding.MGF1(hashes.SHA256()),
                salt_length=32,  # Match frontend
            ),
            hashes.SHA256(),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")

    # Store signed result (server does not modify marks or signature)
    record = {
        "exam_id": payload.exam_id,
        "student_id": payload.student_id,
        "marks": payload.marks,
        "feedback": payload.feedback,
        "instructor_id": instructor_id,
        "instructor_signature": payload.instructor_signature,
        "evaluated_at": payload.evaluated_at,
        "created_at": datetime.utcnow().isoformat(),
    }

    res = supabase.table("results").insert(record).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to store result")

    # Audit log
    supabase.table("audit_logs").insert({
        "user_id": instructor_id,
        "event_type": "publish_result",
        "event_details": f"Published result for exam {payload.exam_id}, student {payload.student_id}",
        "timestamp": datetime.utcnow().isoformat(),
    }).execute()

    return {"message": "Result published", "result": record}


# IMPORTANT: /me routes must come BEFORE /{exam_id} routes to avoid path parameter matching
@router.get("/me")
def get_my_all_results(user=Depends(get_current_user)):
    """
    Return all results for the authenticated student.
    Useful for dashboard analytics.
    """
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can fetch their results")

    student_id = user.get("sub")
    try:
        rec = supabase.table("results").select("*").eq("student_id", student_id).order("evaluated_at", desc=True).execute()
        return {"results": rec.data or []}
    except Exception as e:
        # Table might not exist yet
        return {"results": []}


@router.get("/{exam_id}/{student_id}")
def get_result_for_student(exam_id: str, student_id: str, user=Depends(get_current_user)):
    # Students may fetch their own results; instructors can fetch any
    if user.get("role") == "student" and user.get("sub") != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    rec = supabase.table("results").select("*").eq("exam_id", exam_id).eq("student_id", student_id).execute()
    if not rec.data:
        raise HTTPException(status_code=404, detail="Result not found")

    result_row = rec.data[0]

    # Attach instructor public key so client can verify signature
    instr_id = result_row.get("instructor_id")
    pub = None
    if instr_id:
        key_row = supabase.table("public_keys").select("public_key").eq("user_id", instr_id).execute()
        if key_row.data:
            pub = key_row.data[0].get("public_key")

    return {"result": result_row, "instructor_public_key": pub}


@router.get("/{exam_id}")
def get_my_result(exam_id: str, user=Depends(get_current_user)):
    # Students request their own result; instructors may request any by specifying student_id endpoint
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students may call this endpoint; instructors can use the student-specific path")

    student_id = user.get("sub")
    rec = supabase.table("results").select("*").eq("exam_id", exam_id).eq("student_id", student_id).execute()
    if not rec.data:
        raise HTTPException(status_code=404, detail="Result not found")

    result_row = rec.data[0]

    # Attach instructor public key for verification
    instr_id = result_row.get("instructor_id")
    pub = None
    if instr_id:
        key_row = supabase.table("public_keys").select("public_key").eq("user_id", instr_id).execute()
        if key_row.data:
            pub = key_row.data[0].get("public_key")

    return {"result": result_row, "instructor_public_key": pub}
