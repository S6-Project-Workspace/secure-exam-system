from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_user
from app.db import supabase

router = APIRouter(prefix="/exams", tags=["Exams"])


@router.post("/create")
def create_exam(title: str, description: str = "", duration_minutes: int = 60, user=Depends(get_current_user)):
    # Only instructor can create exams
    if user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create exams")

    instructor_id = user["sub"]

    # Try to insert with duration_minutes, fall back without if column doesn't exist
    try:
        result = supabase.table("exams").insert({
            "instructor_id": instructor_id,
            "title": title,
            "description": description,
            "duration_minutes": duration_minutes
        }).execute()
    except Exception:
        # Column doesn't exist, insert without it
        result = supabase.table("exams").insert({
            "instructor_id": instructor_id,
            "title": title,
            "description": description
        }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create exam")

    return {"message": "Exam created", "exam": result.data[0]}


@router.get("/instructor")
def get_instructor_exams(user=Depends(get_current_user)):
    """
    Return all exams created by the instructor.
    Also includes question count for each exam.
    """
    if user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can access this endpoint")

    instructor_id = user["sub"]
    
    try:
        # Fetch exams for this instructor
        exams = supabase.table("exams").select("*").eq("instructor_id", instructor_id).order("created_at", desc=True).execute()
        
        # For each exam, get question count
        exam_list = []
        for exam in exams.data:
            try:
                q_count = supabase.table("questions").select("question_id", count="exact").eq("exam_id", exam["exam_id"]).execute()
                exam["question_count"] = q_count.count if q_count.count else 0
            except Exception:
                exam["question_count"] = 0
            exam_list.append(exam)
        
        return {"exams": exam_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exams: {str(e)}")


@router.get("/{exam_id}/package")
def get_exam_package(exam_id: str, user=Depends(get_current_user)):
    """
    Return the encrypted exam package for `exam_id`.
    The server returns ciphertext, iv, tag, signature, and exam metadata.
    Decryption and verification must be done client-side.
    """
    # Ensure exam exists and get metadata
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam_info = exam.data[0]

    # Fetch the latest package for this exam
    pkg = supabase.table("exam_packages").select("*").eq("exam_id", exam_id).limit(1).execute()
    if not pkg.data:
        raise HTTPException(status_code=404, detail="Exam package not found")

    p = pkg.data[0]
    return {
        "exam_id": exam_id,
        "title": exam_info.get("title"),
        "description": exam_info.get("description"),
        "duration_minutes": exam_info.get("duration_minutes"),
        "instructor_id": exam_info.get("instructor_id"),
        "encrypted_mcqs": p.get("encrypted_mcqs"),
        "iv": p.get("iv"),
        "tag": p.get("tag"),
        "signature": p.get("signature"),
    }


@router.get("/{exam_id}/key")
def get_wrapped_exam_key(exam_id: str, user=Depends(get_current_user)):
    """
    Return the wrapped AES key for the requesting student only.
    The wrapped key is stored as base64 and was produced using RSA-OAEP by the server
    during publish. The server must NOT unwrap or learn the AES key.
    """
    # Only students should request a wrapped key for themselves
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can request the exam key")

    student_id = user.get("sub")

    # Verify exam exists
    exam = supabase.table("exams").select("*").eq("exam_id", exam_id).execute()
    if not exam.data:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Fetch wrapped key for this student and exam
    rec = supabase.table("exam_keys").select("wrapped_key, package_id").eq("exam_id", exam_id).eq("student_id", student_id).limit(1).execute()
    if not rec.data:
        # Do not reveal whether the exam exists for other students
        raise HTTPException(status_code=404, detail="Wrapped key not found for student")

    row = rec.data[0]
    return {
        "exam_id": exam_id,
        "package_id": row.get("package_id"),
        "wrapped_key": row.get("wrapped_key")  # base64 RSA-OAEP ciphertext
    }


@router.get("/me")
def get_my_exams(user=Depends(get_current_user)):
    """
    Return all available exams for the student.
    In this demo, we return all exams from the exams table.
    """
    # For now, just return all exams.
    # Students can see title, description, created_at etc.
    res = supabase.table("exams").select("*").order("created_at", desc=True).execute()
    return {"exams": res.data}


