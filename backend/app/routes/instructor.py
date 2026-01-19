from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_user
from app.db import supabase



router = APIRouter(prefix="/instructor", tags=["Instructor"])


@router.get("/submissions/{exam_id}")
def list_submissions_for_instructor(exam_id: str, user=Depends(get_current_user)):
    # Only instructors may call this
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can list submissions")

    instructor_id = user.get("sub")

    # Verify instructor owns the exam
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized for this exam")

    # Fetch submissions for the exam
    subs = supabase.table("submissions").select("*").eq("exam_id", exam_id).execute()
    if not subs.data:
        return {"submissions": []}

    out = []
    for s in subs.data:
        submission_id = s.get("submission_id") or s.get("id")
        # Get wrapped AES key for instructor (if stored)
        key_rec = supabase.table("submission_keys").select("wrapped_key").eq("submission_id", submission_id).execute()
        wrapped = None
        if key_rec.data:
            wrapped = key_rec.data[0].get("wrapped_key")

        out.append({
            "submission_id": submission_id,
            "student_id": s.get("student_id"),
            "encrypted_answers": s.get("encrypted_answers"),
            "iv": s.get("iv"),
            "student_signature": s.get("student_signature"),
            "wrapped_aes_key_for_instructor": wrapped,
            "created_at": s.get("created_at"),
        })

    return {"submissions": out}
