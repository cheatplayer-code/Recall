"""Test helpers to seed common entities."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import (
    KnowledgeStatus,
    KnowledgeType,
    ProcessingStage,
    ProcessingStatus,
)
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.models.knowledge import KnowledgeItem
from app.models.user import User
from app.models.workspace import Workspace


async def make_user(session: AsyncSession, email: str = "u@example.com") -> User:
    user = User(email=email, hashed_password="x", full_name="Test User")
    session.add(user)
    await session.flush()
    return user


async def make_workspace(session: AsyncSession, user: User, name: str = "Personal") -> Workspace:
    ws = Workspace(owner_id=user.id, name=name)
    session.add(ws)
    await session.flush()
    return ws


async def make_item(
    session: AsyncSession,
    user: User,
    workspace: Workspace,
    *,
    title: str = "Note",
    content: str = "hello world",
    type_: KnowledgeType = KnowledgeType.NOTE,
    status: KnowledgeStatus = KnowledgeStatus.UPLOADING,
) -> KnowledgeItem:
    item = KnowledgeItem(
        user_id=user.id,
        workspace_id=workspace.id,
        type=type_.value,
        title=title,
        content=content,
        status=status.value,
        tags=[],
    )
    session.add(item)
    await session.flush()
    return item


async def make_processing_job(
    session: AsyncSession, item: KnowledgeItem, user: User
) -> tuple[UploadJob, DocumentProcessingJob]:
    upload = UploadJob(
        user_id=user.id,
        knowledge_item_id=item.id,
        filename=item.title,
        size_bytes=0,
        status="stored",
    )
    session.add(upload)
    await session.flush()
    job = DocumentProcessingJob(
        upload_job_id=upload.id,
        knowledge_item_id=item.id,
        status=ProcessingStatus.QUEUED.value,
        stage=ProcessingStage.UPLOADING.value,
        progress=0.0,
        max_retries=3,
    )
    session.add(job)
    await session.flush()
    return upload, job


def new_uuid() -> uuid.UUID:
    return uuid.uuid4()
