"""KnowledgeChunk + Embedding models.

Vectors are NOT stored here. ``KnowledgeChunk`` holds chunk text + metadata;
``Embedding`` holds metadata *about* a vector (provider/model/dimension/...).
The vector itself lives in the VectorStore.
"""

from __future__ import annotations

import uuid

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import EmbeddingStatus


class KnowledgeChunk(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "knowledge_chunks"

    knowledge_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("knowledge_items.id", ondelete="CASCADE"), index=True, nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    section_title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    embedding_status: Mapped[str] = mapped_column(
        String(32), default=EmbeddingStatus.PENDING.value, index=True, nullable=False
    )
    # Column is "metadata"; Python attribute is "meta" (metadata is reserved).
    meta: Mapped[dict] = mapped_column("metadata", JSON, default=dict, nullable=False)


class Embedding(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "embeddings"

    chunk_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("knowledge_chunks.id", ondelete="CASCADE"), index=True, nullable=False
    )
    provider: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), default="v1", nullable=False)
    dimension: Mapped[int] = mapped_column(Integer, nullable=False)
    checksum: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default=EmbeddingStatus.READY.value, index=True, nullable=False
    )
