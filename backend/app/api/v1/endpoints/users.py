"""User endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.schemas.auth import UserSchema, UserUpdate
from app.services.workspace import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: CurrentUser) -> UserSchema:
    return UserSchema.model_validate(current_user)


@router.patch("/me", response_model=UserSchema)
async def update_me(
    body: UserUpdate, current_user: CurrentUser, session: DbSession
) -> UserSchema:
    user = await UserService(session).update(current_user, body.full_name, body.avatar_url)
    return UserSchema.model_validate(user)
