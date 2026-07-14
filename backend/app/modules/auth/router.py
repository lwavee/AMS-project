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
from app.modules.auth.schema import LoginRequest, LoginResponse, UserProfile, RegisterOutlookRequest
from app.modules.customer.model import Agency
import uuid
import json

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
