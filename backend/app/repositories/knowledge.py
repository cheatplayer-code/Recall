"""KnowledgeItem repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.knowledge import KnowledgeItem
from app.repositories.base import BaseRepository, Page


class KnowledgeRepository(BaseRepository[KnowledgeItem]):
    model = KnowledgeItem

    async def get_owned(
        self, item_id: uuid.UUID, user_id: uuid.UUID
    ) -> KnowledgeItem | None:
        """Fetch an item only if it belongs to the user and isn't soft-deleted."""
        stmt = select(KnowledgeItem).where(
            KnowledgeItem.id == item_id,
            KnowledgeItem.user_id == user_id,
            KnowledgeItem.is_deleted.is_(False),
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 100,
        type_: str | None = None,
        workspace_id: uuid.UUID | None = None,
        favorites_only: bool = False,
    ) -> Page[KnowledgeItem]:
        conditions = [
            KnowledgeItem.user_id == user_id,
            KnowledgeItem.is_deleted.is_(False),
        ]
        if type_:
            conditions.append(KnowledgeItem.type == type_)
        if workspace_id:
            conditions.append(KnowledgeItem.workspace_id == workspace_id)
        if favorites_only:
            conditions.append(KnowledgeItem.is_favorite.is_(True))
        return await self.paginate(
            page, page_size, *conditions, order_by=KnowledgeItem.created_at.desc()
        )
