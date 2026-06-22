"""
Auth Router
-----------
Authentication endpoints for AMS360.

Endpoints:
  POST /api/auth/login   → returns JWT access_token + role
  POST /api/auth/logout  → invalidates session
  GET  /api/auth/me      → returns current user profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
import os
import logging

from app.database.connection import get_db
from app.modules.auth.deps import get_current_user
from app.modules.auth.schema import LoginRequest, LoginResponse, UserProfile

logger = logging.getLogger(__name__)
router = APIRouter()

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_random_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email
    password = req.password

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
    if user:
        encrypted_password = user.encrypted_password
        if encrypted_password:
            # Verify password
            try:
                if bcrypt.checkpw(password.encode('utf-8'), encrypted_password.encode('utf-8')):
                    # Generate JWT access token
                    user_meta = user.raw_user_meta_data or {}
                    if isinstance(user_meta, str):
                        import json
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
            except Exception as e:
                logger.error(f"Local password check failed: {e}")
        
        # If password check failed, raise error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="your password is wrong",
        )
    else:
        # If user does not exist in the database, raise email is wrong
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="email is wrong",
        )
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
