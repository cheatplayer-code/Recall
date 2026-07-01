"""Collection endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, Response, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.schemas.workspace import CollectionCreate, CollectionSchema, CollectionUpdate
from app.services.workspace import CollectionService

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionSchema])
async def list_collections(
    current_user: CurrentUser,
    session: DbSession,
    workspace_id: uuid.UUID = Query(alias="workspaceId"),
) -> list[CollectionSchema]:
    items = await CollectionService(session).list(workspace_id, current_user.id)
    return [CollectionSchema.model_validate(c) for c in items]


@router.post("", response_model=CollectionSchema, status_code=status.HTTP_201_CREATED)
async def create_collection(
    body: CollectionCreate, current_user: CurrentUser, session: DbSession
) -> CollectionSchema:
    coll = await CollectionService(session).create(
        current_user.id, body.workspace_id, body.name, body.description
    )
    return CollectionSchema.model_validate(coll)


@router.get("/{collection_id}", response_model=CollectionSchema)
async def get_collection(
    collection_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> CollectionSchema:
    coll = await CollectionService(session).get(collection_id, current_user.id)
    return CollectionSchema.model_validate(coll)


@router.patch("/{collection_id}", response_model=CollectionSchema)
async def update_collection(
    collection_id: uuid.UUID,
    body: CollectionUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> CollectionSchema:
    coll = await CollectionService(session).update(
        collection_id, current_user.id, name=body.name, description=body.description
    )
    return CollectionSchema.model_validate(coll)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> Response:
    await CollectionService(session).delete(collection_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
