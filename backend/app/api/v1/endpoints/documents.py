"""Document upload + status endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, Form, Response, UploadFile, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.schemas.knowledge import (
    KnowledgeItemSchema,
    ProcessingJobSchema,
    ProcessingStatus,
    UploadJobSchema,
    UploadResponse,
    UrlUploadRequest,
)
from app.services.upload import UploadService

router = APIRouter(prefix="/documents", tags=["documents"])


def _upload_response(item, upload_job, proc_job) -> UploadResponse:  # noqa: ANN001
    return UploadResponse(
        item=KnowledgeItemSchema.model_validate(item),
        upload_job=UploadJobSchema.model_validate(upload_job),
        processing_job=ProcessingJobSchema.model_validate(proc_job),
    )


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    current_user: CurrentUser,
    session: DbSession,
    file: UploadFile = File(...),
    workspace_id: uuid.UUID | None = Form(default=None, alias="workspaceId"),
) -> UploadResponse:
    data = await file.read()
    item, upload_job, proc_job = await UploadService(session).create_upload(
        current_user.id, file.filename or "upload", file.content_type, data, workspace_id
    )
    return _upload_response(item, upload_job, proc_job)


@router.post("/url", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_url(
    body: UrlUploadRequest, current_user: CurrentUser, session: DbSession
) -> UploadResponse:
    item, upload_job, proc_job = await UploadService(session).create_url_upload(
        current_user.id, body.source_url, body.workspace_id
    )
    return _upload_response(item, upload_job, proc_job)


@router.get("/{item_id}/status", response_model=ProcessingStatus)
async def get_status(
    item_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> ProcessingStatus:
    job = await UploadService(session).get_status(item_id, current_user.id)
    return ProcessingStatus(
        job_id=job.id,
        status=job.status,
        stage=job.stage,
        progress=job.progress / 100.0,
        error=job.error,
        retry_count=job.retry_count,
        stages=job.stages,
    )


@router.get("/{item_id}", response_model=KnowledgeItemSchema)
async def get_document(
    item_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> KnowledgeItemSchema:
    from app.services.knowledge import KnowledgeService  # noqa: PLC0415

    item = await KnowledgeService(session).get(item_id, current_user.id)
    return KnowledgeItemSchema.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    item_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> Response:
    await UploadService(session).delete_document(item_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
