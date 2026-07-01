"""Cleanup service: reclaim storage from terminal jobs."""

from __future__ import annotations

import structlog
from sqlalchemy import select

from app.models.enums import ProcessingStatus
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.storage.service import StorageService, get_storage_service

logger = structlog.get_logger(__name__)


class CleanupService:
    def __init__(self, session, storage: StorageService | None = None) -> None:  # noqa: ANN001
        self.session = session
        self.storage = storage or get_storage_service()

    async def cleanup_failed_uploads(self) -> int:
        """Delete stored bytes for uploads whose processing terminally failed."""
        stmt = (
            select(UploadJob)
            .join(
                DocumentProcessingJob,
                DocumentProcessingJob.upload_job_id == UploadJob.id,
            )
            .where(DocumentProcessingJob.status == ProcessingStatus.FAILED.value)
        )
        uploads = list((await self.session.execute(stmt)).scalars().all())
        removed = 0
        for upload in uploads:
            if upload.storage_key:
                try:
                    await self.storage.delete(upload.storage_key)
                    removed += 1
                except Exception:  # pragma: no cover - best-effort
                    logger.warning("cleanup.delete_failed", key=upload.storage_key)
        return removed
