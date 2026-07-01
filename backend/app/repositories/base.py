"""Generic repository base + pagination type. All SQL lives in repositories."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


@dataclass(slots=True)
class Page(Generic[ModelT]):
    items: list[ModelT]
    total: int
    page: int
    page_size: int


class BaseRepository(Generic[ModelT]):
    """CRUD + pagination shared by all domain repositories."""

    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, entity_id: uuid.UUID) -> ModelT | None:
        return await self.session.get(self.model, entity_id)

    async def create(self, **values: Any) -> ModelT:
        entity = self.model(**values)
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def update(self, entity: ModelT, **values: Any) -> ModelT:
        for key, value in values.items():
            setattr(entity, key, value)
        await self.session.flush()
        return entity

    async def delete(self, entity: ModelT) -> None:
        await self.session.delete(entity)
        await self.session.flush()

    async def paginate(
        self,
        page: int,
        page_size: int,
        *conditions: Any,
        order_by: Any = None,
    ) -> Page[ModelT]:
        page = max(1, page)
        page_size = max(1, min(page_size, 200))

        count_stmt = select(func.count()).select_from(self.model)
        list_stmt = select(self.model)
        for condition in conditions:
            count_stmt = count_stmt.where(condition)
            list_stmt = list_stmt.where(condition)
        if order_by is not None:
            list_stmt = list_stmt.order_by(order_by)
        list_stmt = list_stmt.offset((page - 1) * page_size).limit(page_size)

        total = (await self.session.execute(count_stmt)).scalar_one()
        items = list((await self.session.execute(list_stmt)).scalars().all())
        return Page(items=items, total=total, page=page, page_size=page_size)
