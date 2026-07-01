"""Chat (conversation/message) schemas."""

from __future__ import annotations

import datetime
import uuid

from app.schemas.common import CamelModel


class ConversationSchema(CamelModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str | None = None
    last_message_preview: str | None = None
    workspace_id: uuid.UUID | None = None
    attached_memory_ids: list[str] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ConversationCreate(CamelModel):
    title: str | None = None
    workspace_id: uuid.UUID | None = None
    attached_memory_ids: list[str] = []


class MessageSchema(CamelModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    status: str
    error: str | None = None
    citations: list[dict] = []
    chunks: list[dict] = []
    references: list[dict] = []
    created_at: datetime.datetime


class ChatStreamRequest(CamelModel):
    conversation_id: uuid.UUID
    message: str
    attached_memory_ids: list[str] = []
    workspace_id: uuid.UUID | None = None
