"""Upload + processing-job repositories (incl. the claim-next-job queue read)."""

from __future__ import annotations

import datetime
import uuid

from sqlalchemy import or_, select

from app.models.enums import ProcessingStatus, TERMINAL_PROCESSING_STATUSES, UploadStatus
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.repositories.base import BaseRepository


class UploadJobRepository(BaseRepository[UploadJob]):
    model = UploadJob

    async def find_active_by_checksum(
        self, user_id: uuid.UUID, checksum: str
    ) -> UploadJob | None:
        stmt = select(UploadJob).where(
            UploadJob.user_id == user_id,
            UploadJob.checksum == checksum,
            UploadJob.status != UploadStatus.FAILED.value,
        )
        return (await self.session.execute(stmt)).scalars().first()

    async def list_for_user(self, user_id: uuid.UUID) -> list[UploadJob]:
        stmt = (
            select(UploadJob)
            .where(UploadJob.user_id == user_id)
            .order_by(UploadJob.created_at.desc())
        )
        return list((await self.session.execute(stmt)).scalars().all())


class DocumentProcessingJobRepository(BaseRepository[DocumentProcessingJob]):
    model = DocumentProcessingJob

    async def get_by_knowledge_item(
        self, knowledge_item_id: uuid.UUID
    ) -> DocumentProcessingJob | None:
        stmt = select(DocumentProcessingJob).where(
            DocumentProcessingJob.knowledge_item_id == knowledge_item_id
        )
        return (await self.session.execute(stmt)).scalars().first()

    async def claim_next_job(self, worker_id: str) -> DocumentProcessingJob | None:
        """Atomically claim the oldest runnable job.

        Uses ``FOR UPDATE SKIP LOCKED`` so N workers never claim the same job.
        SQLite ignores the lock clause harmlessly (single-writer in tests).
        """
        now = datetime.datetime.now(datetime.UTC)
        stmt = (
            select(DocumentProcessingJob)
            .where(
                DocumentProcessingJob.status == ProcessingStatus.QUEUED.value,
                or_(
                    DocumentProcessingJob.next_retry_at.is_(None),
                    DocumentProcessingJob.next_retry_at <= now,
                ),
            )
            .order_by(DocumentProcessingJob.created_at.asc())
            .limit(1)
            .with_for_update(skip_locked=True)
        )
        job = (await self.session.execute(stmt)).scalars().first()
        if job is None:
            return None
        job.status = ProcessingStatus.PROCESSING.value
        job.worker_id = worker_id
        await self.session.flush()
        return job

    @staticmethod
    def is_terminal(job: DocumentProcessingJob) -> bool:
        return ProcessingStatus(job.status) in TERMINAL_PROCESSING_STATUSES
