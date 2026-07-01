"""Knowledge endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, Response, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.dependencies.pagination import Pagination
from app.schemas.common import Page
from app.schemas.knowledge import (
    KnowledgeItemCreate,
    KnowledgeItemSchema,
    KnowledgeItemUpdate,
)
from app.services.knowledge import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("", response_model=Page[KnowledgeItemSchema])
async def list_knowledge(
    current_user: CurrentUser,
    session: DbSession,
    pagination: Pagination,
    type_: str | None = Query(default=None, alias="type"),
    workspace_id: uuid.UUID | None = Query(default=None, alias="workspaceId"),
    favorites_only: bool = Query(default=False, alias="favoritesOnly"),
) -> Page[KnowledgeItemSchema]:
    page = await KnowledgeService(session).list(
        current_user.id,
        page=pagination.page,
        page_size=pagination.page_size,
        type_=type_,
        workspace_id=workspace_id,
        favorites_only=favorites_only,
    )
    return Page[KnowledgeItemSchema](
        items=[KnowledgeItemSchema.model_validate(i) for i in page.items],
        total=page.total,
        page=page.page,
        page_size=page.page_size,
    )


@router.post("", response_model=KnowledgeItemSchema, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    body: KnowledgeItemCreate, current_user: CurrentUser, session: DbSession
) -> KnowledgeItemSchema:
    item = await KnowledgeService(session).create(
        current_user.id, **body.model_dump(exclude_unset=True)
    )
    return KnowledgeItemSchema.model_validate(item)


@router.get("/{item_id}", response_model=KnowledgeItemSchema)
async def get_knowledge(
    item_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> KnowledgeItemSchema:
    item = await KnowledgeService(session).get(item_id, current_user.id)
    return KnowledgeItemSchema.model_validate(item)


@router.patch("/{item_id}", response_model=KnowledgeItemSchema)
async def update_knowledge(
    item_id: uuid.UUID,
    body: KnowledgeItemUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> KnowledgeItemSchema:
    item = await KnowledgeService(session).update(
        item_id, current_user.id, **body.model_dump(exclude_unset=True)
    )
    return KnowledgeItemSchema.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge(
    item_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> Response:
    await KnowledgeService(session).delete(item_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
