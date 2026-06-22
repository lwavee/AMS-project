from pydantic import BaseModel, EmailStr


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
