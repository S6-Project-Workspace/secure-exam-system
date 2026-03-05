import os
from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, keys, publish
from app.routes import exams, questions
from app.routes import instructor, results


app = FastAPI()

# Build CORS origins: always allow local dev, plus production frontend URL if set
_frontend_url = os.getenv("FRONTEND_URL", "")
allow_origins = [
    "http://localhost:5173",   # React Vite frontend (local dev)
    "http://localhost:5174",   # Alternate Vite port
    "http://127.0.0.1:5173",  # Frontend via IP
]
if _frontend_url:
    allow_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# OAuth2 setup (used for protected routes)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Register routers
app.include_router(auth.router)
app.include_router(keys.router)
app.include_router(exams.router)
app.include_router(questions.router)
app.include_router(publish.router)
from app.routes import submissions
app.include_router(submissions.router)
app.include_router(instructor.router)
app.include_router(results.router)




@app.get("/")
def home():
    return {"message": "Secure Exam Backend Running"}
