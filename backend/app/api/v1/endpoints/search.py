"""Search endpoints: lexical (GET) + vector/retrieval (POST family)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query
from sqlalchemy import or_, select

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.models.knowledge import KnowledgeItem
from app.schemas.search import (
    RelatedRequest,
    RetrievalRequest,
    RetrievalResponse,
    SearchHistoryItem,
    SearchResponse,
    SearchResultItem,
    SimilarRequest,
)
from app.services.retrieval import RetrievalService

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def lexical_search(
    current_user: CurrentUser,
    session: DbSession,
    query: str = Query(...),
    workspace_id: uuid.UUID | None = Query(default=None, alias="workspaceId"),
    limit: int = Query(default=20, ge=1, le=100),
) -> SearchResponse:
    pattern = f"%{query}%"
    conditions = [
        KnowledgeItem.user_id == current_user.id,
        KnowledgeItem.is_deleted.is_(False),
        or_(
            KnowledgeItem.title.ilike(pattern),
            KnowledgeItem.content.ilike(pattern),
            KnowledgeItem.excerpt.ilike(pattern),
        ),
    ]
    if workspace_id:
        conditions.append(KnowledgeItem.workspace_id == workspace_id)
    stmt = select(KnowledgeItem).where(*conditions).limit(limit)
    items = (await session.execute(stmt)).scalars().all()
    return SearchResponse(
        query=query,
        results=[
            SearchResultItem(
                kind=item.type,
                knowledge_item_id=str(item.id),
                title=item.title,
                excerpt=item.excerpt,
                thumbnail_url=item.thumbnail_url,
                score=1.0,
            )
            for item in items
        ],
    )


@router.post("", response_model=RetrievalResponse)
async def vector_search(
    body: RetrievalRequest, current_user: CurrentUser, session: DbSession
) -> RetrievalResponse:
    return await RetrievalService(session).search(
        current_user.id, body.query, body.filters, body.limit, body.offset, body.cursor
    )


@router.post("/similar", response_model=RetrievalResponse)
async def similar(
    body: SimilarRequest, current_user: CurrentUser, session: DbSession
) -> RetrievalResponse:
    return await RetrievalService(session).similar(
        current_user.id, body.chunk_id, body.document_id, body.limit
    )


@router.post("/related", response_model=RetrievalResponse)
async def related(
    body: RelatedRequest, current_user: CurrentUser, session: DbSession
) -> RetrievalResponse:
    return await RetrievalService(session).related(
        current_user.id, body.document_id, body.limit
    )


@router.get("/history", response_model=list[SearchHistoryItem])
async def history(
    current_user: CurrentUser, session: DbSession, limit: int = Query(default=20, ge=1, le=100)
) -> list[SearchHistoryItem]:
    return await RetrievalService(session).history(current_user.id, limit)


@router.get("/chunks/{chunk_id}")
async def get_chunk(
    chunk_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> dict[str, str]:
    text = await RetrievalService(session).get_chunk_text(chunk_id)
    return {"chunkId": str(chunk_id), "text": text}


@router.post("/debug")
async def debug(
    body: RetrievalRequest, current_user: CurrentUser, session: DbSession
) -> dict:
    return await RetrievalService(session).debug(current_user.id, body.query, body.filters)
