"""Conversation + Message repositories."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.chat import Conversation, Message
from app.repositories.base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    model = Conversation

    async def list_for_user(self, user_id: uuid.UUID) -> list[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        return list((await self.session.execute(stmt)).scalars().all())


class MessageRepository(BaseRepository[Message]):
    model = Message

    async def list_for_conversation(
        self, conversation_id: uuid.UUID
    ) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list((await self.session.execute(stmt)).scalars().all())
