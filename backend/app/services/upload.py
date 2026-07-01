"""Upload service: validate → store → create rows → enqueue processing."""

from __future__ import annotations

import uuid
from urllib.parse import urlparse

import structlog

from app.core.config.settings import Settings, get_settings
from app.core.errors import (
    BadRequestError,
    NotFoundError,
    PayloadTooLargeError,
    UnsupportedMediaTypeError,
)
from app.models.enums import (
    KnowledgeStatus,
    KnowledgeType,
    ProcessingStage,
    ProcessingStatus,
    UploadStatus,
)
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.models.knowledge import KnowledgeItem
from app.repositories.jobs import DocumentProcessingJobRepository, UploadJobRepository
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.user import WorkspaceRepository
from app.retrieval.vector_store import get_vector_store
from app.storage.service import StorageService, get_storage_service
from app.workers.tasks import enqueue_document_processing

logger = structlog.get_logger(__name__)

_MB = 1024 * 1024


class UploadService:
    def __init__(
        self,
        session,  # noqa: ANN001
        settings: Settings | None = None,
        storage: StorageService | None = None,
    ) -> None:
        self.session = session
        self.settings = settings or get_settings()
        self.storage = storage or get_storage_service()
        self.uploads = UploadJobRepository(session)
        self.jobs = DocumentProcessingJobRepository(session)
        self.knowledge = KnowledgeRepository(session)
        self.workspaces = WorkspaceRepository(session)

    # -- validation -------------------------------------------------------
    def _knowledge_type(self, content_type: str | None) -> KnowledgeType:
        ct = (content_type or "").lower()
        if ct.startswith("image/"):
            return KnowledgeType.PHOTO
        if ct == "application/pdf":
            return KnowledgeType.PDF
        if ct.startswith("video/"):
            return KnowledgeType.VIDEO
        if ct.startswith("audio/"):
            return KnowledgeType.VOICE
        if ct.startswith("text/"):
            return KnowledgeType.NOTE
        return KnowledgeType.DOCUMENT

    def _max_bytes(self, ktype: KnowledgeType) -> int:
        s = self.settings
        mapping = {
            KnowledgeType.PHOTO: s.max_upload_size_mb_image,
            KnowledgeType.PDF: s.max_upload_size_mb_pdf,
            KnowledgeType.VIDEO: s.max_upload_size_mb_video,
            KnowledgeType.VOICE: s.max_upload_size_mb_audio,
        }
        return mapping.get(ktype, s.max_upload_size_mb) * _MB

    def _validate(self, content_type: str | None, data: bytes) -> KnowledgeType:
        if not data:
            raise BadRequestError("The uploaded file is empty.")
        ktype = self._knowledge_type(content_type)
        if ktype == KnowledgeType.DOCUMENT and content_type and not _is_document_mime(content_type):
            raise UnsupportedMediaTypeError(f"Unsupported file type: {content_type}")
        limit = self._max_bytes(ktype)
        if len(data) > limit:
            raise PayloadTooLargeError(
                f"This file is {len(data) // _MB} MB, which exceeds the "
                f"{limit // _MB} MB limit for this file type."
            )
        return ktype

    async def _resolve_workspace(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID | None
    ) -> uuid.UUID:
        if workspace_id is not None:
            return workspace_id
        ws = await self.workspaces.get_default_for_user(user_id)
        if ws is None:
            raise BadRequestError("No workspace available for this user.")
        return ws.id

    # -- create -----------------------------------------------------------
    async def create_upload(
        self,
        user_id: uuid.UUID,
        filename: str,
        content_type: str | None,
        data: bytes,
        workspace_id: uuid.UUID | None = None,
    ) -> tuple[KnowledgeItem, UploadJob, DocumentProcessingJob]:
        ktype = self._validate(content_type, data)
        ws_id = await self._resolve_workspace(user_id, workspace_id)
        stored = await self.storage.save(filename, content_type, data)

        is_image = ktype == KnowledgeType.PHOTO
        item = await self.knowledge.create(
            user_id=user_id,
            workspace_id=ws_id,
            type=ktype.value,
            title=filename,
            status=KnowledgeStatus.UPLOADING.value,
            file_url=stored.public_url,
            preview_url=stored.public_url if is_image else None,
            thumbnail_url=stored.public_url if is_image else None,
            tags=[],
        )
        upload_job = await self.uploads.create(
            user_id=user_id,
            knowledge_item_id=item.id,
            filename=filename,
            content_type=content_type,
            size_bytes=stored.size_bytes,
            checksum=stored.checksum,
            storage_key=stored.storage_key,
            public_url=stored.public_url,
            status=UploadStatus.STORED.value,
        )
        proc_job = await self.jobs.create(
            upload_job_id=upload_job.id,
            knowledge_item_id=item.id,
            status=ProcessingStatus.QUEUED.value,
            stage=ProcessingStage.UPLOADING.value,
            progress=0.0,
            max_retries=self.settings.worker_max_retries,
        )
        await self.session.commit()
        await enqueue_document_processing(proc_job.id, item.id)
        logger.info("upload.created", knowledge_item_id=str(item.id), type=ktype.value)
        return item, upload_job, proc_job

    async def create_url_upload(
        self,
        user_id: uuid.UUID,
        source_url: str,
        workspace_id: uuid.UUID | None = None,
    ) -> tuple[KnowledgeItem, UploadJob, DocumentProcessingJob]:
        ws_id = await self._resolve_workspace(user_id, workspace_id)
        ktype = _url_type(source_url)
        item = await self.knowledge.create(
            user_id=user_id,
            workspace_id=ws_id,
            type=ktype.value,
            title=source_url,
            content=source_url,
            source_url=source_url,
            status=KnowledgeStatus.UPLOADING.value,
            tags=[],
        )
        upload_job = await self.uploads.create(
            user_id=user_id,
            knowledge_item_id=item.id,
            filename=source_url,
            source_url=source_url,
            status=UploadStatus.STORED.value,
        )
        proc_job = await self.jobs.create(
            upload_job_id=upload_job.id,
            knowledge_item_id=item.id,
            status=ProcessingStatus.QUEUED.value,
            stage=ProcessingStage.UPLOADING.value,
            max_retries=self.settings.worker_max_retries,
        )
        await self.session.commit()
        await enqueue_document_processing(proc_job.id, item.id)
        return item, upload_job, proc_job

    # -- status / delete --------------------------------------------------
    async def get_status(
        self, item_id: uuid.UUID, user_id: uuid.UUID
    ) -> DocumentProcessingJob:
        item = await self.knowledge.get_owned(item_id, user_id)
        if item is None:
            raise NotFoundError("Memory not found.")
        job = await self.jobs.get_by_knowledge_item(item_id)
        if job is None:
            raise NotFoundError("No processing job for this memory.")
        return job

    async def delete_document(self, item_id: uuid.UUID, user_id: uuid.UUID) -> None:
        item = await self.knowledge.get_owned(item_id, user_id)
        if item is None:
            raise NotFoundError("Memory not found.")

        job = await self.jobs.get_by_knowledge_item(item_id)
        if job is not None and not DocumentProcessingJobRepository.is_terminal(job):
            job.status = ProcessingStatus.CANCELLED.value

        # Delete stored bytes (look up via the item's upload job).
        upload = await self._upload_for_item(item_id)
        if upload is not None and upload.storage_key:
            try:
                await self.storage.delete(upload.storage_key)
            except Exception:  # pragma: no cover - best-effort file cleanup
                logger.warning("upload.delete_file_failed", key=upload.storage_key)

        # Purge vectors for this document; chunks/embeddings cascade with the item.
        await get_vector_store().delete_embeddings({"knowledge_item_id": str(item_id)})

        item.is_deleted = True
        item.status = KnowledgeStatus.DELETED.value
        await self.session.commit()
        logger.info("upload.deleted", knowledge_item_id=str(item_id))

    async def _upload_for_item(self, item_id: uuid.UUID) -> UploadJob | None:
        from sqlalchemy import select  # noqa: PLC0415

        stmt = select(UploadJob).where(UploadJob.knowledge_item_id == item_id)
        return (await self.session.execute(stmt)).scalars().first()


def _is_document_mime(content_type: str) -> bool:
    allowed_prefixes = ("application/",)
    allowed = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/json",
        "application/octet-stream",
    }
    return content_type in allowed or content_type.startswith(allowed_prefixes)


def _url_type(url: str) -> KnowledgeType:
    host = (urlparse(url).hostname or "").lower()
    if "youtube.com" in host or "youtu.be" in host:
        return KnowledgeType.VIDEO
    return KnowledgeType.WEBSITE
