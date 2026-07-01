"""KnowledgeItem — the core unit of memory."""

from __future__ import annotations

import datetime
import uuid

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import EmbeddingStatus, KnowledgeStatus, KnowledgeType


class KnowledgeItem(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "knowledge_items"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False
    )
    collection_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("collections.id", ondelete="SET NULL"), index=True, nullable=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(32), default=KnowledgeType.NOTE.value, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)

    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    preview_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    status: Mapped[str] = mapped_column(
        String(32), default=KnowledgeStatus.UPLOADING.value, index=True, nullable=False
    )
    embedding_status: Mapped[str] = mapped_column(
        String(32), default=EmbeddingStatus.PENDING.value, nullable=False
    )
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    # AI enrichment facet (summary, mood, topics, key_moments, action_items),
    # produced by the enrichment seam during processing and rendered as-is by the
    # frontend. Null until enrichment runs (or when disabled).
    ai: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(
        Boolean, default=False, index=True, nullable=False
    )

    occurred_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_accessed_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
