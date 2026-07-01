"""Authentication service: register/login/refresh/me."""

from __future__ import annotations

import uuid

import structlog

from app.core.errors import ConflictError, UnauthorizedError
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository, WorkspaceRepository
from app.schemas.auth import TokenResponse

logger = structlog.get_logger(__name__)


class AuthService:
    def __init__(self, session) -> None:  # noqa: ANN001 - AsyncSession
        self.session = session
        self.users = UserRepository(session)
        self.workspaces = WorkspaceRepository(session)

    async def register(
        self, email: str, password: str, full_name: str | None
    ) -> tuple[User, TokenResponse]:
        email = email.lower()
        if await self.users.get_by_email(email):
            raise ConflictError("An account with this email already exists.")
        user = await self.users.create(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
        )
        # Auto-create the default "Personal" workspace.
        await self.workspaces.create(owner_id=user.id, name="Personal")
        await self.session.commit()
        logger.info("auth.register", user_id=str(user.id))
        return user, self._issue_tokens(user.id)

    async def login(self, email: str, password: str) -> tuple[User, TokenResponse]:
        user = await self.users.get_by_email(email.lower())
        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password.")
        return user, self._issue_tokens(user.id)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise UnauthorizedError("Invalid refresh token.") from exc
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Not a refresh token.")
        return self._issue_tokens(uuid.UUID(payload["sub"]))

    async def me(self, user_id: uuid.UUID) -> User:
        user = await self.users.get(user_id)
        if user is None:
            raise UnauthorizedError("User not found.")
        return user

    @staticmethod
    def _issue_tokens(user_id: uuid.UUID) -> TokenResponse:
        return TokenResponse(
            access_token=create_token(str(user_id), "access"),
            refresh_token=create_token(str(user_id), "refresh"),
        )
