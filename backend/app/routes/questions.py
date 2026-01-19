# backend/app/routes/questions.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from app.routes.auth import get_current_user
from app.db import supabase

router = APIRouter(prefix="/questions", tags=["Questions"])


class QuestionCreate(BaseModel):
    exam_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str = Field(..., description="One of: 'A','B','C','D'")
    marks: Optional[int] = 1

    @field_validator("correct_answer")
    def valid_correct(cls, v):
        if v not in {"A", "B", "C", "D"}:
            raise ValueError("correct_answer must be one of 'A','B','C','D'")
        return v


@router.post("/add")
def add_question(payload: QuestionCreate, user=Depends(get_current_user)):
    # Only instructors allowed to add
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can add questions")

    instructor_id = user["sub"]
    # Verify instructor owns the exam
    exam = supabase.table("exams").select("*").eq("exam_id", payload.exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="You are not the owner of this exam")

    # Insert question
    result = supabase.table("questions").insert({
        "exam_id": payload.exam_id,
        "question_text": payload.question_text,
        "option_a": payload.option_a,
        "option_b": payload.option_b,
        "option_c": payload.option_c,
        "option_d": payload.option_d,
        "correct_answer": payload.correct_answer,
        "marks": payload.marks
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to insert question")

    return {"message": "Question added", "question": result.data[0]}


@router.get("/list")
def list_questions(exam_id: str, user=Depends(get_current_user)):
    # Only instructor (owner) can list questions here (plaintext)
    if user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can list questions")

    instructor_id = user["sub"]
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.data[0].get("instructor_id") != instructor_id:
        raise HTTPException(status_code=403, detail="You are not the owner of this exam")

    q = supabase.table("questions").select("*").eq("exam_id", exam_id).execute()
    return {"questions": q.data}
