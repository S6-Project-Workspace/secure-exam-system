from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.routes.auth import get_current_user
from app.db import supabase

router = APIRouter(prefix="/keys", tags=["Public Keys"])


@router.post("/upload")
def upload_public_key(public_key: str, user=Depends(get_current_user)):
    user_id = user["sub"]

    # Check if key exists already
    existing = supabase.table("public_keys").select("*").eq("user_id", user_id).execute()

    if existing.data:
        # Update key
        result = supabase.table("public_keys").update({
            "public_key": public_key,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).execute()

        return {
            "message": "Public key updated successfully",
            "data": result.data
        }

    # Insert new key
    result = supabase.table("public_keys").insert({
        "user_id": user_id,
        "public_key": public_key
    }).execute()

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
