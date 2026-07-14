from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    role: str
    email: str


class UserProfile(BaseModel):
    id: str
    email: str
    role: str


class RegisterOutlookRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

