"""Auth + user schemas."""

from __future__ import annotations

import datetime
import uuid

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = None


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RefreshRequest(CamelModel):
    refresh_token: str


class TokenResponse(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserSchema(CamelModel):
    id: uuid.UUID
    email: str
    full_name: str | None = None
    avatar_url: str | None = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime.datetime


class UserUpdate(CamelModel):
    full_name: str | None = None
    avatar_url: str | None = None
