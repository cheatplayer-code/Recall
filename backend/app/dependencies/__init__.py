"""FastAPI dependency-injection primitives."""

from __future__ import annotations

from app.dependencies.auth import CurrentUser, get_current_user
from app.dependencies.db import DbSession
from app.dependencies.pagination import Pagination, PaginationParams

__all__ = [
    "DbSession",
    "CurrentUser",
    "get_current_user",
    "Pagination",
    "PaginationParams",
]
