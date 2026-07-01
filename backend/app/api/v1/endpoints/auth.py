"""Auth endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Response, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserSchema,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, session: DbSession) -> TokenResponse:
    _, tokens = await AuthService(session).register(body.email, body.password, body.full_name)
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: DbSession) -> TokenResponse:
    _, tokens = await AuthService(session).login(body.email, body.password)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, session: DbSession) -> TokenResponse:
    return await AuthService(session).refresh(body.refresh_token)


@router.get("/me", response_model=UserSchema)
async def me(current_user: CurrentUser) -> UserSchema:
    return UserSchema.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: CurrentUser) -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)
