"""Workspace + collection + user services."""

from __future__ import annotations

import uuid

from app.core.errors import ForbiddenError, NotFoundError
from app.models.user import User
from app.models.workspace import Collection, Workspace
from app.repositories.user import (
    CollectionRepository,
    UserRepository,
    WorkspaceRepository,
)


class UserService:
    def __init__(self, session) -> None:  # noqa: ANN001
        self.session = session
        self.users = UserRepository(session)

    async def update(
        self, user: User, full_name: str | None, avatar_url: str | None
    ) -> User:
        if full_name is not None:
            user.full_name = full_name
        if avatar_url is not None:
            user.avatar_url = avatar_url
        await self.session.commit()
        return user


class WorkspaceService:
    def __init__(self, session) -> None:  # noqa: ANN001
        self.session = session
        self.repo = WorkspaceRepository(session)

    async def list(self, user_id: uuid.UUID) -> list[Workspace]:
        return await self.repo.list_for_user(user_id)

    async def get(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Workspace:
        ws = await self.repo.get(workspace_id)
        if ws is None:
            raise NotFoundError("Workspace not found.")
        if ws.owner_id != user_id:
            raise ForbiddenError("Not your workspace.")
        return ws

    async def create(
        self, user_id: uuid.UUID, name: str, description: str | None
    ) -> Workspace:
        ws = await self.repo.create(owner_id=user_id, name=name, description=description)
        await self.session.commit()
        return ws

    async def update(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID, **values
    ) -> Workspace:
        ws = await self.get(workspace_id, user_id)
        for key, value in values.items():
            if value is not None:
                setattr(ws, key, value)
        await self.session.commit()
        return ws

    async def delete(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> None:
        ws = await self.get(workspace_id, user_id)
        await self.repo.delete(ws)
        await self.session.commit()


class CollectionService:
    def __init__(self, session) -> None:  # noqa: ANN001
        self.session = session
        self.repo = CollectionRepository(session)
        self.workspaces = WorkspaceRepository(session)

    async def _assert_workspace(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> None:
        ws = await self.workspaces.get(workspace_id)
        if ws is None:
            raise NotFoundError("Workspace not found.")
        if ws.owner_id != user_id:
            raise ForbiddenError("Not your workspace.")

    async def list(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> list[Collection]:
        await self._assert_workspace(workspace_id, user_id)
        return await self.repo.list_for_workspace(workspace_id)

    async def get(self, collection_id: uuid.UUID, user_id: uuid.UUID) -> Collection:
        coll = await self.repo.get(collection_id)
        if coll is None:
            raise NotFoundError("Collection not found.")
        await self._assert_workspace(coll.workspace_id, user_id)
        return coll

    async def create(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID, name: str, description: str | None
    ) -> Collection:
        await self._assert_workspace(workspace_id, user_id)
        coll = await self.repo.create(
            workspace_id=workspace_id, name=name, description=description
        )
        await self.session.commit()
        return coll

    async def update(
        self, collection_id: uuid.UUID, user_id: uuid.UUID, **values
    ) -> Collection:
        coll = await self.get(collection_id, user_id)
        for key, value in values.items():
            if value is not None:
                setattr(coll, key, value)
        await self.session.commit()
        return coll

    async def delete(self, collection_id: uuid.UUID, user_id: uuid.UUID) -> None:
        coll = await self.get(collection_id, user_id)
        await self.repo.delete(coll)
        await self.session.commit()
