from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_random_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # 1. Try decoding the token locally first
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "agent"),
            "raw": payload
        }
    except jwt.PyJWTError:
        pass

    # 2. Fallback to Supabase / mock validation
    if not SUPABASE_URL or not SUPABASE_ANON_KEY or SUPABASE_ANON_KEY == "YOUR_SUPABASE_ANON_KEY":
        # Fallback Mock Mode
        if token == "mock-agent-token" or token.startswith("mock-"):
            if "agency" in token:
                return {"email": "agency@capco.com", "role": "agency", "id": "c0247d05-5abd-4492-8019-e8e77cfcef29"}
            elif "agent" in token or "eidan" in token:
                return {"email": "eidan@capco.com", "role": "agent", "id": "797bdcc4-ae33-4451-8aa0-ee857c006a0c"}
            return {"email": "agent@capco.com", "role": "agent", "id": "797bdcc4-ae33-4451-8aa0-ee857c006a0c"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Validate token using Supabase User API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token}"
                },
                timeout=5.0
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )

            user_data = response.json()
            user_metadata = user_data.get("user_metadata", {})
            app_metadata = user_data.get("app_metadata", {})
            role = user_metadata.get("role") or app_metadata.get("role") or "agent"

            return {
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "role": role,
                "raw": user_data
            }
    except httpx.RequestError as e:
        logger.error(f"Supabase network error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

def require_role(allowed_roles: list):
    def dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this role"
            )
        return current_user
    return dependency
