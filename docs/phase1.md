# Phase 1 — As of 09/12/25   - Completed 25% of the project

Secure Online Examination System — Cryptographic verification

Tech stack: FastAPI, Supabase, JWT, Argon2/bcrypt

### ✅ 1. Backend Core Setup — 100% COMPLETE
### ✅ 2. User Authentication System — 100% COMPLETE
### ✅ 3. Authorization & Protected Routes — 100% COMPLETE

---

## 1. Project initialization & environment

What we did

- Created the `backend/` layout: `app/`, `routes/`, `db.py`, `.env`.
- Created and activated a Python virtual environment.
- Installed required packages (examples):

```text
fastapi
uvicorn
supabase==1.0.3
passlib
bcrypt
argon2-cffi
pyjwt
python-dotenv
```

Why this matters

- Clean, modular API structure.
- Controlled dependencies for reproducible cryptographic behavior.
- Predictable runtime for authentication and signing flows.


## 2. Supabase project setup & configuration

What we did

- Created a Supabase project and recorded the Project URL and keys.
- Added the Anon (frontend) and Service-Role (backend) keys to `.env`.
- Enabled Row-Level Security (RLS) and designed schema policies.

Why this matters

- Supabase stores users, keys, exams, encrypted papers, submissions, and audit logs.
- RLS enforces per-role access (students, instructors, admins).

How it helps

- Prevents unauthorized data access and reduces the attack surface.


## 3. Supabase integration in FastAPI

What we did

- Implemented `app/db.py` with a Supabase client:

```py
from supabase import create_client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
```

- Picked a Supabase Python SDK release compatible with the stack (e.g. v1.0.3).

Why this matters

- Backend routes use Supabase to register users, store hashes, and fetch data.


## 4. Secure user registration

What we did

- Implemented `POST /auth/register`.
- Checks for an existing user, hashes the password, stores `email`, `password_hash`, and `role`.

Hashing choices

- Argon2 (preferred): memory-hard and GPU-resistant.
- bcrypt (fallback): widely supported and compatible.

Why hashing

- Passwords are one-way hashed to prevent credential theft and database compromises.


## 5. Secure login & JWT generation

What we did

- Implemented `POST /auth/login`.
- Verifies credentials and issues a JWT containing user id, role, issued-at, and expiration (e.g. 5 hours).

Why JWT

- Stateless authentication, signed (HS256) with `JWT_SECRET`.
- Simple Bearer usage for frontend clients.


## 6. Simpler Bearer auth for Swagger

What we did

- Used an HTTP Bearer / OAuth2PasswordBearer flow configured for JWTs so Swagger can test endpoints.

Why this matters

- Cleaner flow for JWT-based systems; easier testing in Swagger UI.


## 7. First protected API: `/auth/me`

What we did

- Added a protected endpoint that decodes the JWT and returns the current user claims.

Why this matters

- Confirms the authentication pipeline: valid tokens, expiration handling, and role claims.


---

