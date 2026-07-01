"""Chat endpoints. RAG generation is a Phase 2 seam; this ships the protocol.

The stream emits the exact SSE frame sequence the frontend consumes
(``retrieval`` → ``token``* → ``citations`` → ``done``). Retrieval is real
(RetrievalService); the token generation is a deterministic placeholder until the
LLM is wired in Phase 2 — the frame contract is what must stay stable.
"""

from __future__ import annotations

import json
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.repositories.chat import ConversationRepository, MessageRepository
from app.schemas.chat import (
    ChatStreamRequest,
    ConversationCreate,
    ConversationSchema,
    MessageSchema,
)
from app.services.retrieval import RetrievalService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations", response_model=list[ConversationSchema])
async def list_conversations(
    current_user: CurrentUser, session: DbSession
) -> list[ConversationSchema]:
    items = await ConversationRepository(session).list_for_user(current_user.id)
    return [ConversationSchema.model_validate(c) for c in items]


@router.post("/conversations", response_model=ConversationSchema, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    body: ConversationCreate, current_user: CurrentUser, session: DbSession
) -> ConversationSchema:
    repo = ConversationRepository(session)
    conv = await repo.create(
        user_id=current_user.id,
        title=body.title,
        workspace_id=body.workspace_id,
        attached_memory_ids=body.attached_memory_ids,
    )
    await session.commit()
    return ConversationSchema.model_validate(conv)


@router.get("/conversations/{conversation_id}", response_model=ConversationSchema)
async def get_conversation(
    conversation_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> ConversationSchema:
    conv = await ConversationRepository(session).get(conversation_id)
    return ConversationSchema.model_validate(conv)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageSchema])
async def list_messages(
    conversation_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> list[MessageSchema]:
    items = await MessageRepository(session).list_for_conversation(conversation_id)
    return [MessageSchema.model_validate(m) for m in items]


@router.post("/stream")
async def chat_stream(
    body: ChatStreamRequest, current_user: CurrentUser, session: DbSession
) -> StreamingResponse:
    retrieval = await RetrievalService(session).search(current_user.id, body.message)

    async def event_source() -> AsyncIterator[bytes]:
        # 1) retrieval frame
        chunks = [c.model_dump(by_alias=True) for c in retrieval.citations]
        yield _frame("retrieval", {"chunks": chunks})
        # 2) token frames (Phase 2 placeholder generation)
        answer = (
            "This is a placeholder answer. RAG generation is wired in Phase 2; "
            "retrieval above is real."
        )
        for token in answer.split(" "):
            yield _frame("token", {"token": token + " "})
        # 3) citations frame
        yield _frame("citations", {"citations": chunks})
        # 4) done
        yield _frame("done", {})

    return StreamingResponse(event_source(), media_type="text/event-stream")


def _frame(frame_type: str, payload: dict) -> bytes:
    return f"data: {json.dumps({'type': frame_type, **payload})}\n\n".encode()
