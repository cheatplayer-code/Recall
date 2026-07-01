"""Knowledge item service (CRUD + ownership)."""

from __future__ import annotations

import uuid

from app.core.errors import NotFoundError
from app.models.enums import KnowledgeStatus
from app.models.knowledge import KnowledgeItem
from app.repositories.base import Page
from app.repositories.knowledge import KnowledgeRepository


class KnowledgeService:
    def __init__(self, session) -> None:  # noqa: ANN001
        self.session = session
        self.repo = KnowledgeRepository(session)

    async def list(
        self,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 100,
        type_: str | None = None,
        workspace_id: uuid.UUID | None = None,
        favorites_only: bool = False,
    ) -> Page[KnowledgeItem]:
        return await self.repo.list_for_user(
            user_id,
            page=page,
            page_size=page_size,
            type_=type_,
            workspace_id=workspace_id,
            favorites_only=favorites_only,
        )

    async def get(self, item_id: uuid.UUID, user_id: uuid.UUID) -> KnowledgeItem:
        item = await self.repo.get_owned(item_id, user_id)
        if item is None:
            raise NotFoundError("Memory not found.")
        return item

    async def create(self, user_id: uuid.UUID, **values) -> KnowledgeItem:
        item = await self.repo.create(
            user_id=user_id, status=KnowledgeStatus.READY.value, **values
        )
        await self.session.commit()
        return item

    async def update(
        self, item_id: uuid.UUID, user_id: uuid.UUID, **values
    ) -> KnowledgeItem:
        item = await self.get(item_id, user_id)
        for key, value in values.items():
            setattr(item, key, value)
        await self.session.commit()
        return item

    async def delete(self, item_id: uuid.UUID, user_id: uuid.UUID) -> None:
        item = await self.get(item_id, user_id)
        item.is_deleted = True
        item.status = KnowledgeStatus.DELETED.value
        await self.session.commit()
