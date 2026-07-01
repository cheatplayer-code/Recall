"""Upload + document-processing job models (the durable queue)."""

from __future__ import annotations

import datetime
import uuid

from sqlalchemy import (
    JSON,
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ProcessingStage, ProcessingStatus, UploadStatus


class UploadJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "upload_jobs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    knowledge_item_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("knowledge_items.id", ondelete="SET NULL"), index=True, nullable=True
    )

    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    # Indexed for integrity / future dedup, but intentionally NOT unique.
    checksum: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    public_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    status: Mapped[str] = mapped_column(
        String(32), default=UploadStatus.QUEUED.value, index=True, nullable=False
    )
    error: Mapped[str | None] = mapped_column(Text, nullable=True)


class DocumentProcessingJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "document_processing_jobs"

    upload_job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("upload_jobs.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    knowledge_item_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("knowledge_items.id", ondelete="SET NULL"), index=True, nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(32), default=ProcessingStatus.QUEUED.value, index=True, nullable=False
    )
    stage: Mapped[str] = mapped_column(
        String(32), default=ProcessingStage.UPLOADING.value, index=True, nullable=False
    )
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    stages: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)

    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    worker_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    next_retry_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), index=True, nullable=True
    )
    started_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
