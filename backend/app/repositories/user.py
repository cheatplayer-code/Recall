"""User and Workspace/Collection repositories."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.user import User
from app.models.workspace import Collection, Workspace
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return (await self.session.execute(stmt)).scalar_one_or_none()


class WorkspaceRepository(BaseRepository[Workspace]):
    model = Workspace

    async def list_for_user(self, user_id: uuid.UUID) -> list[Workspace]:
        stmt = (
            select(Workspace)
            .where(Workspace.owner_id == user_id)
            .order_by(Workspace.created_at.asc())
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def get_default_for_user(self, user_id: uuid.UUID) -> Workspace | None:
        workspaces = await self.list_for_user(user_id)
        return workspaces[0] if workspaces else None


class CollectionRepository(BaseRepository[Collection]):
    model = Collection

    async def list_for_workspace(self, workspace_id: uuid.UUID) -> list[Collection]:
        stmt = (
            select(Collection)
            .where(Collection.workspace_id == workspace_id)
            .order_by(Collection.created_at.desc())
        )
        return list((await self.session.execute(stmt)).scalars().all())
