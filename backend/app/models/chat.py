"""Conversation + Message models (AI chat)."""

from __future__ import annotations

import uuid

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import MessageRole, MessageStatus


class Conversation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    last_message_preview: Mapped[str | None] = mapped_column(Text, nullable=True)
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("workspaces.id", ondelete="SET NULL"), index=True, nullable=True
    )
    attached_memory_ids: Mapped[list[str]] = mapped_column(
        JSON, default=list, nullable=False
    )


class Message(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(32), default=MessageRole.USER.value, nullable=False
    )
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default=MessageStatus.COMPLETE.value, nullable=False
    )
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    citations: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    chunks: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    references: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
