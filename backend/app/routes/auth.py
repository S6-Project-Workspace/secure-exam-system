from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import jwt

from app.db import supabase

# -----------------------------
# CONFIG
# -----------------------------
router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "student"


class LoginRequest(BaseModel):
    email: str
    password: str

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGO = os.getenv("JWT_ALGO", "HS256")

# 🔥 Correct scheme for JWT Bearer tokens
auth_scheme = HTTPBearer()


# -----------------------------
# AUTH HELPERS
# -----------------------------
def create_jwt_token(user_id: str, role: str):
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=5),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return token


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# -----------------------------
# PUBLIC ROUTES
# -----------------------------
@router.post("/register")
def register_user(payload: RegisterRequest):
    email = payload.email
    password = payload.password
    role = payload.role
    # Check if user already exists
    existing = supabase.table("users").select("*").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = hash_password(password)

    result = supabase.table("users").insert({
        "email": email,
        "password_hash": password_hash,
        "role": role,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="DB insert failed")

    return {"message": "User registered successfully", "user": result.data}


@router.post("/login")
def login_user(payload: LoginRequest):
    email = payload.email
    password = payload.password
    user_data = supabase.table("users").select("*").eq("email", email).execute()

    if not user_data.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user = user_data.data[0]

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_jwt_token(user["id"], user["role"])

    return {"message": "Login successful", "token": token, "role": user["role"]}


# -----------------------------
# PROTECTED ROUTE (Updated)
# -----------------------------
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
def get_profile(user=Depends(get_current_user)):
    return {"user": user}
