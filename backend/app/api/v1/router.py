"""Aggregate all v1 routers."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    collections,
    documents,
    knowledge,
    search,
    upload_jobs,
    users,
    workspaces,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(workspaces.router)
api_router.include_router(collections.router)
api_router.include_router(knowledge.router)
api_router.include_router(documents.router)
api_router.include_router(upload_jobs.router)
api_router.include_router(chat.router)
api_router.include_router(search.router)
