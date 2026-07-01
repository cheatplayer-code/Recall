"""Workspace + collection schemas."""

from __future__ import annotations

import datetime
import uuid

from app.schemas.common import CamelModel


class WorkspaceSchema(CamelModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class WorkspaceCreate(CamelModel):
    name: str
    description: str | None = None


class WorkspaceUpdate(CamelModel):
    name: str | None = None
    description: str | None = None


class CollectionSchema(CamelModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    description: str | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class CollectionCreate(CamelModel):
    name: str
    description: str | None = None
    workspace_id: uuid.UUID


class CollectionUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
