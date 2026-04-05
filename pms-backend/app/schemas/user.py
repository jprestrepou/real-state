"""
User schemas — Pydantic v2 request/response models.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ─────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=200)
    role: str = Field(default="Gestor", pattern="^(Admin|Propietario|Gestor)$")
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


# ── User CRUD ────────────────────────────────────────────
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    phone: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(Admin|Propietario|Gestor)$")
    is_active: Optional[bool] = None


# ── Self-service profile ─────────────────────────────────
class ProfileUpdate(BaseModel):
    """What a user can update about themselves."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


# ── Admin password reset ─────────────────────────────────
class AdminPasswordReset(BaseModel):
    """Schema for admin to reset another user's password."""
    new_password: str = Field(min_length=8, max_length=128)


# ── Extended response ────────────────────────────────────
class UserResponseFull(UserResponse):
    """Extended profile response with avatar, last_login, work_group."""
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    work_group_id: Optional[str] = None
