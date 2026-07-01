"""ProcessingWorker — owns orchestration: claim, advance, retry, events, commit.

This is the stable kernel. It never contains modality logic; it only drives the
``DocumentProcessor`` stages and persists status/progress. Per the architecture,
once built this file is treated as off-limits to ML changes.
"""

from __future__ import annotations

import asyncio
import datetime
import socket
import uuid
from dataclasses import dataclass

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config.settings import Settings, get_settings
from app.database.session import session_scope
from app.events.publisher import EventPublisher, get_event_publisher
from app.events.types import EventType, JobEvent
from app.models.enums import (
    EmbeddingStatus,
    KnowledgeStatus,
    ProcessingStage,
    ProcessingStatus,
)
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.models.knowledge import KnowledgeItem
from app.models.workspace import Collection
from app.repositories.jobs import DocumentProcessingJobRepository
from app.retrieval.embedder import get_embedder
from app.retrieval.vector_store import get_vector_store
from app.workers.processor import DocumentProcessor, ProcessingContext

logger = structlog.get_logger(__name__)


@dataclass(slots=True)
class _Stage:
    method: str
    job_status: ProcessingStatus
    stage: ProcessingStage
    item_status: KnowledgeStatus
    progress: float


# The ordered pipeline. Each entry maps a processor method to the status/progress
# the worker records before/after running it.
_PIPELINE: list[_Stage] = [
    _Stage("prepare", ProcessingStatus.PROCESSING, ProcessingStage.PROCESSING, KnowledgeStatus.PROCESSING, 10.0),
    _Stage("extract", ProcessingStatus.PROCESSING, ProcessingStage.EXTRACTING, KnowledgeStatus.EXTRACTING, 35.0),
    _Stage("chunk", ProcessingStatus.CHUNKING, ProcessingStage.CHUNKING, KnowledgeStatus.CHUNKING, 55.0),
    _Stage("embed", ProcessingStatus.EMBEDDING, ProcessingStage.EMBEDDING, KnowledgeStatus.EMBEDDING, 80.0),
    _Stage("index", ProcessingStatus.INDEXING, ProcessingStage.INDEXING, KnowledgeStatus.INDEXING, 95.0),
]


class ProcessingWorker:
    def __init__(
        self,
        processor: DocumentProcessor | None = None,
        settings: Settings | None = None,
        publisher: EventPublisher | None = None,
        worker_id: str | None = None,
    ) -> None:
        self.processor = processor or DocumentProcessor()
        self.settings = settings or get_settings()
        self.publisher = publisher or get_event_publisher()
        self.worker_id = worker_id or f"{socket.gethostname()}:{uuid.uuid4().hex[:8]}"
        self._stop = asyncio.Event()

    # -- main loop --------------------------------------------------------
    async def run_forever(self) -> None:
        logger.info("worker.start", worker_id=self.worker_id)
        while not self._stop.is_set():
            try:
                processed = await self.process_next()
            except Exception:  # pragma: no cover - defensive; loop must survive
                logger.error("worker.loop_error", exc_info=True)
                processed = False
            if not processed:
                await asyncio.sleep(self.settings.worker_poll_interval_seconds)

    def stop(self) -> None:
        self._stop.set()

    async def process_next(self) -> bool:
        """Claim and process one job. Returns False if the queue was empty."""
        async with session_scope() as session:
            repo = DocumentProcessingJobRepository(session)
            job = await repo.claim_next_job(self.worker_id)
            if job is None:
                return False
            # Commit the claim immediately to release the row lock.
            await session.commit()
            await self._process_job(session, job)
        return True

    # -- per-job ----------------------------------------------------------
    async def _process_job(self, session: AsyncSession, job: DocumentProcessingJob) -> None:
        item = await session.get(KnowledgeItem, job.knowledge_item_id) if job.knowledge_item_id else None
        if item is None:
            await self._fail(session, job, None, "knowledge item missing")
            return
        upload = await session.get(UploadJob, job.upload_job_id)
        collection = (
            await session.get(Collection, item.collection_id)
            if item.collection_id
            else None
        )
        ctx = ProcessingContext(
            job=job,
            item=item,
            upload=upload,
            session=session,
            embedder=get_embedder(),
            vector_store=get_vector_store(),
            settings=self.settings,
            collection=collection,
        )

        job.started_at = _now()
        await self.publisher.publish(
            JobEvent(
                type=EventType.PROCESSING_STARTED,
                job_id=str(job.id),
                knowledge_item_id=str(item.id),
            )
        )

        for stage in _PIPELINE:
            if await self._is_cancelled(session, job):
                logger.info("worker.cancelled", job_id=str(job.id))
                return
            try:
                method = getattr(self.processor, stage.method)
                updates = await method(ctx)
                self._apply_item_updates(item, updates)
                self._advance_job(job, stage)
                item.status = stage.item_status.value
                await session.commit()
                await self._publish_stage(job, item, stage)
            except Exception as exc:  # noqa: BLE001 - converted to retry/backoff
                # Capture ids before rollback expires the ORM state.
                job_id, item_id = job.id, item.id
                await session.rollback()
                await self._handle_failure(session, job_id, item_id, stage, exc)
                return

        await self._finalize(session, job, item)

    def _apply_item_updates(self, item: KnowledgeItem, updates: dict) -> None:
        for key, value in updates.items():
            setattr(item, key, value)

    def _advance_job(self, job: DocumentProcessingJob, stage: _Stage) -> None:
        job.status = stage.job_status.value
        job.stage = stage.stage.value
        job.progress = stage.progress
        history = list(job.stages or [])
        history.append(
            {"stage": stage.stage.value, "progress": stage.progress, "at": _now().isoformat()}
        )
        job.stages = history

    async def _publish_stage(
        self, job: DocumentProcessingJob, item: KnowledgeItem, stage: _Stage
    ) -> None:
        await self.publisher.publish(
            JobEvent(
                type=EventType.PROGRESS,
                job_id=str(job.id),
                knowledge_item_id=str(item.id),
                stage=stage.stage.value,
                status=job.status,
                progress=stage.progress,
            )
        )
        if stage.method == "chunk":
            await self.publisher.publish(
                JobEvent(EventType.CHUNK_CREATED, str(job.id), str(item.id), data={"count": item.chunk_count})
            )
        elif stage.method == "embed":
            await self.publisher.publish(
                JobEvent(EventType.CHUNK_EMBEDDED, str(job.id), str(item.id))
            )
        elif stage.method == "index":
            await self.publisher.publish(
                JobEvent(EventType.CHUNK_INDEXED, str(job.id), str(item.id))
            )

    async def _finalize(
        self, session: AsyncSession, job: DocumentProcessingJob, item: KnowledgeItem
    ) -> None:
        job.status = ProcessingStatus.READY.value
        job.stage = ProcessingStage.READY.value
        job.progress = 100.0
        job.finished_at = _now()
        item.status = KnowledgeStatus.READY.value
        item.embedding_status = EmbeddingStatus.READY.value
        await session.commit()
        await self.publisher.publish(
            JobEvent(EventType.PROCESSING_FINISHED, str(job.id), str(item.id), progress=100.0)
        )
        await self.publisher.publish(
            JobEvent(EventType.KNOWLEDGE_READY, str(job.id), str(item.id))
        )
        logger.info("worker.ready", job_id=str(job.id), knowledge_item_id=str(item.id))

    # -- failure / retry --------------------------------------------------
    async def _handle_failure(
        self,
        session: AsyncSession,
        job_id: uuid.UUID,
        item_id: uuid.UUID | None,
        stage: _Stage,
        exc: Exception,
    ) -> None:
        # After rollback the ORM state is expired; reload fully (populate_existing)
        # so attribute access doesn't trigger a sync lazy-load (MissingGreenlet).
        job = await session.get(DocumentProcessingJob, job_id, populate_existing=True)
        if job is None:
            return

        job.retry_count += 1
        job.error = f"{stage.method}: {exc}"
        if job.retry_count <= job.max_retries:
            backoff = self.settings.worker_backoff_base_seconds * (2 ** (job.retry_count - 1))
            job.status = ProcessingStatus.QUEUED.value
            job.next_retry_at = _now() + datetime.timedelta(seconds=backoff)
            logger.warning(
                "worker.retry",
                job_id=str(job.id),
                stage=stage.method,
                retry_count=job.retry_count,
                backoff_s=backoff,
            )
        else:
            await self._set_failed(session, job, item_id)
            logger.error("worker.failed", job_id=str(job.id), stage=stage.method, error=str(exc))
        await session.commit()
        await self.publisher.publish(
            JobEvent(
                EventType.PROCESSING_FAILED,
                str(job.id),
                str(item_id) if item_id else None,
                stage=stage.stage.value,
                status=job.status,
                data={"error": str(exc), "retry_count": job.retry_count},
            )
        )

    async def _fail(
        self,
        session: AsyncSession,
        job: DocumentProcessingJob,
        item: KnowledgeItem | None,
        reason: str,
    ) -> None:
        job.error = reason
        await self._set_failed(session, job, item.id if item else None)
        await session.commit()

    async def _set_failed(
        self, session: AsyncSession, job: DocumentProcessingJob, item_id: uuid.UUID | None
    ) -> None:
        job.status = ProcessingStatus.FAILED.value
        job.finished_at = _now()
        if item_id is not None:
            item = await session.get(KnowledgeItem, item_id)
            if item is not None:
                item.status = KnowledgeStatus.FAILED.value

    async def _is_cancelled(self, session: AsyncSession, job: DocumentProcessingJob) -> bool:
        await session.refresh(job, ["status"])
        return job.status == ProcessingStatus.CANCELLED.value


def _now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)
