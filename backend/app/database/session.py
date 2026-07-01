"""Async engine + session factory.

The engine is built lazily from settings so tests can point ``RECALL_DATABASE_URL``
at SQLite before anything is imported. SQLite ``:memory:`` is given a StaticPool so
a single in-memory database is shared across sessions for the test session.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import lru_cache

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from app.core.config.settings import get_settings


@lru_cache
def get_engine() -> AsyncEngine:
    """Process-wide async engine, configured from settings."""
    settings = get_settings()
    url = settings.database_url
    kwargs: dict[str, object] = {"future": True, "echo": False}

    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if ":memory:" in url:
            # Share one in-memory DB across all sessions (tests).
            kwargs["poolclass"] = StaticPool
    else:
        kwargs["pool_size"] = 10
        kwargs["max_overflow"] = 20
        kwargs["pool_pre_ping"] = True

    engine = create_async_engine(url, **kwargs)

    if url.startswith("sqlite"):
        # SQLite needs foreign keys enabled per-connection for ON DELETE CASCADE.
        @event.listens_for(engine.sync_engine, "connect")
        def _fk_pragma(dbapi_conn, _record) -> None:  # noqa: ANN001
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


@lru_cache
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(), expire_on_commit=False, class_=AsyncSession
    )


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session."""
    async with get_sessionmaker()() as session:
        yield session


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """Standalone async session context (used by the worker)."""
    async with get_sessionmaker()() as session:
        yield session
