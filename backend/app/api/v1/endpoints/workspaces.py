"""Workspace endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Response, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import DbSession
from app.schemas.workspace import WorkspaceCreate, WorkspaceSchema, WorkspaceUpdate
from app.services.workspace import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceSchema])
async def list_workspaces(current_user: CurrentUser, session: DbSession) -> list[WorkspaceSchema]:
    items = await WorkspaceService(session).list(current_user.id)
    return [WorkspaceSchema.model_validate(w) for w in items]


@router.post("", response_model=WorkspaceSchema, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    body: WorkspaceCreate, current_user: CurrentUser, session: DbSession
) -> WorkspaceSchema:
    ws = await WorkspaceService(session).create(current_user.id, body.name, body.description)
    return WorkspaceSchema.model_validate(ws)


@router.get("/{workspace_id}", response_model=WorkspaceSchema)
async def get_workspace(
    workspace_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> WorkspaceSchema:
    ws = await WorkspaceService(session).get(workspace_id, current_user.id)
    return WorkspaceSchema.model_validate(ws)


@router.patch("/{workspace_id}", response_model=WorkspaceSchema)
async def update_workspace(
    workspace_id: uuid.UUID,
    body: WorkspaceUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> WorkspaceSchema:
    ws = await WorkspaceService(session).update(
        workspace_id, current_user.id, name=body.name, description=body.description
    )
    return WorkspaceSchema.model_validate(ws)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> Response:
    await WorkspaceService(session).delete(workspace_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
