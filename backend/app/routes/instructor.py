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
        submission_id = s.get("sub_id") or s.get("submission_id") or s.get("id")
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
            "submitted_at": s.get("submitted_at") or s.get("created_at"),
        })

    return {"submissions": out}


@router.get("/exam/{exam_id}/answer-key")
def get_answer_key(exam_id: str, user=Depends(get_current_user)):
    """
    Return the full answer key (questions + correct answers) for auto-grading.
    Only the exam owner (instructor) can access this.
    """
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can access answer keys")

    instructor_id = user.get("sub")

    # Verify instructor owns the exam
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized for this exam")

    # Fetch all questions with correct answers
    questions = supabase.table("questions").select("*").eq("exam_id", exam_id).execute()

    answer_key = []
    for q in (questions.data or []):
        answer_key.append({
            "question_id": q.get("id") or q.get("question_id"),
            "question_text": q.get("question_text"),
            "option_a": q.get("option_a"),
            "option_b": q.get("option_b"),
            "option_c": q.get("option_c"),
            "option_d": q.get("option_d"),
            "correct_answer": q.get("correct_answer"),
            "marks": q.get("marks", 1),
        })

    return {
        "exam_id": exam_id,
        "title": exam.data[0].get("title"),
        "total_questions": len(answer_key),
        "total_marks": sum(q["marks"] for q in answer_key),
        "questions": answer_key,
    }

