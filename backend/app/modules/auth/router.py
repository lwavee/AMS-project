"""
Auth Router
-----------
Authentication endpoints for AMS360.

Endpoints:
  POST /api/auth/login   → returns JWT access_token + role
  POST /api/auth/logout  → invalidates session
  GET  /api/auth/me      → returns current user profile
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
import os
import time
import logging
from collections import defaultdict

from app.core.config import settings
from app.database.connection import get_db
from app.modules.auth.deps import get_current_user
from app.modules.auth.schema import LoginRequest, LoginResponse, UserProfile, RegisterOutlookRequest
from app.modules.customer.model import Agency
import uuid
import json

logger = logging.getLogger(__name__)
router = APIRouter()

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = os.getenv("ALGORITHM", "HS256")
# 30-day token lifetime (43,200 minutes) to prevent users from being logged out unexpectedly
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

# Rate limiter tracking failed login attempts per client IP (sliding window of 60 seconds)
# Max 5 failed attempts per IP within a 60-second window
FAILED_LOGIN_ATTEMPTS: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 60.0  # seconds
MAX_FAILED_ATTEMPTS = 5
DUMMY_BCRYPT_HASH = b"$2b$12$e80yqX0q2q7KqD5g8Yp0euFqXnJg4mI5Z8Q3bC5d7e9f1a2b3c4d5"


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = req.email.strip().lower() if req.email else ""
    password = req.password

    # 0. Rate limiting check (Brute-forcing / Credential-stuffing mitigation)
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    recent_attempts = [t for t in FAILED_LOGIN_ATTEMPTS[client_ip] if now - t < RATE_LIMIT_WINDOW]
    FAILED_LOGIN_ATTEMPTS[client_ip] = recent_attempts

    if len(recent_attempts) >= MAX_FAILED_ATTEMPTS:
        logger.warning(f"Login rate limit exceeded for client IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again after 60 seconds.",
            headers={"Retry-After": "60"}
        )

    # 1. Look up user in database
    user = None
    try:
        user = db.execute(
            text("select id, email, encrypted_password, raw_user_meta_data from auth.users where email = :email"),
            {"email": email}
        ).first()
    except Exception as e:
        logger.error(f"Failed to check user existence in auth.users: {e}")

    # Fallback to public/default schema users table if not found in auth.users
    if not user:
        try:
            user = db.execute(
                text("select id, email, encrypted_password, raw_user_meta_data from users where email = :email"),
                {"email": email}
            ).first()
        except Exception as e:
            logger.error(f"Failed to check user existence in public.users: {e}")

    # 2. If user exists in DB, perform local bcrypt check
    is_authenticated = False
    if user and user.encrypted_password:
        try:
            if bcrypt.checkpw(password.encode('utf-8'), user.encrypted_password.encode('utf-8')):
                is_authenticated = True
        except Exception as e:
            logger.error(f"Local password check failed: {e}")
    else:
        # User not found: run dummy bcrypt comparison to thwart side-channel timing attacks
        try:
            bcrypt.checkpw(password.encode('utf-8'), DUMMY_BCRYPT_HASH)
        except Exception:
            pass

    if is_authenticated and user:
        # Clear rate-limit history for this client on successful login
        FAILED_LOGIN_ATTEMPTS.pop(client_ip, None)

        # Generate JWT access token
        user_meta = user.raw_user_meta_data or {}
        if isinstance(user_meta, str):
            try:
                user_meta = json.loads(user_meta)
            except Exception:
                user_meta = {}
        role = user_meta.get("role") or "agent"
        
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": role,
            "exp": expire
        }
        access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return LoginResponse(access_token=access_token, role=role, email=email)

    # 3. Authentication failed: Record failed attempt and return uniform error
    FAILED_LOGIN_ATTEMPTS[client_ip].append(time.time())
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"}
    )
@router.post("/register-outlook", response_model=LoginResponse)
async def register_outlook(req: RegisterOutlookRequest, db: Session = Depends(get_db)):
    email = req.email
    password = req.password
    name = req.name or email.split("@")[0].capitalize()

    # Check if user exists in auth.users or users
    user_exists = False
    try:
        user_exists = db.execute(
            text("select id from auth.users where email = :email"),
            {"email": email}
        ).first() is not None
    except Exception:
        pass

    if not user_exists:
        try:
            user_exists = db.execute(
                text("select id from users where email = :email"),
                {"email": email}
            ).first() is not None
        except Exception:
            pass

    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # 1. Create a user ID
    user_id = str(uuid.uuid4())
    meta = {"role": "agency", "full_name": name}
    meta_str = json.dumps(meta)

    # 2. Hash password in Python
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # 3. Insert user credentials into auth.users or users
    user_inserted = False
    try:
        db.execute(
            text("""
                insert into auth.users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                values (:id, :email, :password, :meta, now(), 'agency', 'authenticated')
            """),
            {"id": user_id, "email": email, "password": hashed_password, "meta": meta_str}
        )
        user_inserted = True
    except Exception as e:
        logger.warning(f"Could not insert into auth.users: {e}. Trying public.users fallback.")
        db.rollback()

    if not user_inserted:
        try:
            db.execute(
                text("""
                    insert into users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at, role, aud)
                    values (:id, :email, :password, :meta, :confirmed_at, 'agency', 'authenticated')
                """),
                {
                    "id": user_id, 
                    "email": email, 
                    "password": hashed_password, 
                    "meta": meta_str, 
                    "confirmed_at": datetime.now(timezone.utc)
                }
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create user in fallback: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}"
            )

    # 4. Create Agency record linked to the user
    try:
        agency = db.query(Agency).filter(Agency.email == email).first()
        if not agency:
            agency = Agency(name=name, email=email, user_id=user_id)
            db.add(agency)
        else:
            # Update user_id if agency existed but didn't have user_id
            setattr(agency, "user_id", user_id)
            setattr(agency, "name", name)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create Agency record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agency record: {str(e)}"
        )

    # 5. Generate JWT token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "role": "agency",
        "exp": expire
    }
    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return LoginResponse(access_token=access_token, role="agency", email=email)


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out"}



@router.get("/me", response_model=UserProfile)
async def me(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        id=current_user.get("id", ""),
        email=current_user.get("email", ""),
        role=current_user.get("role", "agent"),
    )
