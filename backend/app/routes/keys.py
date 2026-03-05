from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.routes.auth import get_current_user
from app.db import supabase
import base64
import json

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey

router = APIRouter(prefix="/keys", tags=["Public Keys"])


def wrap_keys_for_student(user_id: str, public_key_json: str):
    """
    After a student uploads their public key, retroactively wrap AES keys
    for any published exams that don't yet have a wrapped key for this student.
    """
    # Parse the student's OAEP public key
    try:
        key_data = json.loads(public_key_json)
        oaep_pem = key_data.get("oaep")
        if not oaep_pem:
            return  # No OAEP key, can't wrap
        student_pub = load_pem_public_key(oaep_pem.encode())
    except (json.JSONDecodeError, Exception):
        try:
            student_pub = load_pem_public_key(public_key_json.encode())
        except Exception:
            return  # Invalid key, skip

    if not isinstance(student_pub, RSAPublicKey) or getattr(student_pub, "key_size", 0) < 2048:
        return

    # Find all published exam packages
    packages = supabase.table("exam_packages").select("package_id, exam_id, aes_key_b64").execute()
    if not packages.data:
        return

    for pkg in packages.data:
        exam_id = pkg.get("exam_id")
        package_id = pkg.get("package_id") or pkg.get("id")
        aes_key_b64 = pkg.get("aes_key_b64")

        if not aes_key_b64 or not package_id:
            continue

        # Check if this student already has a wrapped key for this exam
        existing = supabase.table("exam_keys").select("id").eq(
            "exam_id", exam_id
        ).eq("student_id", user_id).execute()

        if existing.data:
            continue  # Already has a key, skip

        # Wrap the AES key for this student
        try:
            k_exam = base64.b64decode(aes_key_b64)
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
                "student_id": user_id,
                "wrapped_key": wrapped_b64
            }).execute()
        except Exception:
            continue  # Skip if wrapping fails


@router.post("/upload")
def upload_public_key(public_key: str, user=Depends(get_current_user)):
    user_id = user["sub"]
    user_role = user.get("role", "")

    # Check if key exists already
    existing = supabase.table("public_keys").select("*").eq("user_id", user_id).execute()

    if existing.data:
        # Update key
        result = supabase.table("public_keys").update({
            "public_key": public_key,
        }).eq("user_id", user_id).execute()

        # Retroactively wrap keys for students
        if user_role == "student":
            wrap_keys_for_student(user_id, public_key)

        return {
            "message": "Public key updated successfully",
            "data": result.data
        }

    # Insert new key
    result = supabase.table("public_keys").insert({
        "user_id": user_id,
        "public_key": public_key
    }).execute()

    # Retroactively wrap keys for students
    if user_role == "student":
        wrap_keys_for_student(user_id, public_key)

    return {
        "message": "Public key uploaded successfully",
        "data": result.data
    }


@router.get("/get")
def get_public_key(user_id: str, user=Depends(get_current_user)):
    """
    Fetch public key for a specific user.
    Used by students to verify instructor signatures.
    """
    result = supabase.table("public_keys").select("public_key").eq("user_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Public key not found for user")
    
    return {
        "user_id": user_id,
        "public_key": result.data[0]["public_key"]
    }

