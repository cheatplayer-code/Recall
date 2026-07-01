"""Enqueue helpers.

In the DB-as-queue design, inserting a ``DocumentProcessingJob`` row with status
``QUEUED`` *is* the enqueue. These helpers exist for API symmetry and to emit an
optional notification; they never block the request path.
"""

from __future__ import annotations

import uuid

import structlog

from app.models.enums import ProcessingStatus

logger = structlog.get_logger(__name__)


async def enqueue_document_processing(job_id: uuid.UUID, knowledge_item_id: uuid.UUID) -> None:
    """Mark a processing job as runnable (the row is already QUEUED on insert)."""
    logger.info(
        "tasks.enqueue",
        job_id=str(job_id),
        knowledge_item_id=str(knowledge_item_id),
        status=ProcessingStatus.QUEUED.value,
    )
