"""Upload-job listing + SSE progress stream."""

from __future__ import annotations

import asyncio
import json
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.events.bridge import get_event_bridge
from app.repositories.jobs import DocumentProcessingJobRepository, UploadJobRepository
from app.schemas.knowledge import ProcessingJobSchema

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.get("/jobs", response_model=list[ProcessingJobSchema])
async def list_jobs(current_user: CurrentUser, session: DbSession) -> list[ProcessingJobSchema]:
    uploads = await UploadJobRepository(session).list_for_user(current_user.id)
    job_repo = DocumentProcessingJobRepository(session)
    out: list[ProcessingJobSchema] = []
    for upload in uploads:
        if upload.knowledge_item_id is None:
            continue
        job = await job_repo.get_by_knowledge_item(upload.knowledge_item_id)
        if job is not None:
            out.append(ProcessingJobSchema.model_validate(job))
    return out


@router.get("/jobs/{job_id}", response_model=ProcessingJobSchema)
async def get_job(
    job_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> ProcessingJobSchema:
    job = await DocumentProcessingJobRepository(session).get(job_id)
    return ProcessingJobSchema.model_validate(job)


@router.get("/jobs/{job_id}/stream")
async def stream_job(job_id: uuid.UUID, current_user: CurrentUser) -> StreamingResponse:
    bridge = get_event_bridge()

    async def event_source() -> AsyncIterator[bytes]:
        async with bridge.subscribe() as queue:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                except TimeoutError:
                    yield b": keep-alive\n\n"
                    continue
                if event.get("job_id") != str(job_id):
                    continue
                yield f"data: {json.dumps(event)}\n\n".encode()
                if event.get("type") in {"processing_finished", "processing_failed"}:
                    break

    return StreamingResponse(event_source(), media_type="text/event-stream")
