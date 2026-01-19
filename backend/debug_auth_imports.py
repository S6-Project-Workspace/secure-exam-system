print("Importing APIRouter, HTTPException, Depends from fastapi...")
from fastapi import APIRouter, HTTPException, Depends
print("Importing HTTPBearer, HTTPAuthorizationCredentials from fastapi.security...")
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
print("Importing BaseModel from pydantic...")
from pydantic import BaseModel
print("Importing CryptContext from passlib.context...")
from passlib.context import CryptContext
print("Importing datetime, timedelta from datetime...")
from datetime import datetime, timedelta
print("Importing os...")
import os
print("Importing jwt...")
import jwt
print("Importing supabase from app.db...")
from app.db import supabase
print("All imports in auth.py succeeded")
