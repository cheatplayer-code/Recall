"""Chunk, Embedding, and SearchSession repositories."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select, update

from app.models.chunk import Embedding, KnowledgeChunk
from app.models.enums import EmbeddingStatus
from app.models.search import SearchSession
from app.repositories.base import BaseRepository


class KnowledgeChunkRepository(BaseRepository[KnowledgeChunk]):
    model = KnowledgeChunk

    async def list_by_knowledge_item(
        self, knowledge_item_id: uuid.UUID
    ) -> list[KnowledgeChunk]:
        stmt = (
            select(KnowledgeChunk)
            .where(KnowledgeChunk.knowledge_item_id == knowledge_item_id)
            .order_by(KnowledgeChunk.chunk_index.asc())
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def get_owned(
        self, chunk_id: uuid.UUID
    ) -> KnowledgeChunk | None:
        return await self.session.get(KnowledgeChunk, chunk_id)

    async def bulk_create(self, chunks: list[dict[str, Any]]) -> list[KnowledgeChunk]:
        entities = [KnowledgeChunk(**data) for data in chunks]
        self.session.add_all(entities)
        await self.session.flush()
        return entities

    async def mark_embedded(self, chunk_ids: list[uuid.UUID]) -> None:
        if not chunk_ids:
            return
        stmt = (
            update(KnowledgeChunk)
            .where(KnowledgeChunk.id.in_(chunk_ids))
            .values(embedding_status=EmbeddingStatus.READY.value)
        )
        await self.session.execute(stmt)


class EmbeddingRepository(BaseRepository[Embedding]):
    model = Embedding

    async def bulk_create(self, embeddings: list[dict[str, Any]]) -> list[Embedding]:
        entities = [Embedding(**data) for data in embeddings]
        self.session.add_all(entities)
        await self.session.flush()
        return entities


class SearchRepository(BaseRepository[SearchSession]):
    model = SearchSession

    async def log_search(
        self,
        user_id: uuid.UUID,
        query: str,
        filters: dict[str, Any],
        latency_ms: float,
        result_count: int,
    ) -> SearchSession:
        return await self.create(
            user_id=user_id,
            query=query,
            filters=filters,
            latency_ms=latency_ms,
            result_count=result_count,
        )

    async def recent(self, user_id: uuid.UUID, limit: int = 20) -> list[SearchSession]:
        stmt = (
            select(SearchSession)
            .where(SearchSession.user_id == user_id)
            .order_by(SearchSession.created_at.desc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())
