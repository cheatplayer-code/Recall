"""Test configuration.

CI must run without GPU/network, so the embedding seam is forced to the
deterministic backend for the test session *before* settings are read. Tests
that exercise the real model opt back in explicitly and skip if unavailable.
"""

from __future__ import annotations

import os
import tempfile
from collections.abc import AsyncIterator

# Force deterministic, dependency-free backends for the whole test session.
os.environ.setdefault("RECALL_EMBEDDING_PROVIDER", "deterministic")
os.environ.setdefault("RECALL_VECTOR_STORE_BACKEND", "memory")
os.environ.setdefault("RECALL_VECTOR_DIMENSION", "256")
os.environ.setdefault("RECALL_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("RECALL_STORAGE_DIR", os.path.join(tempfile.gettempdir(), "recall_test_storage"))

import pytest_asyncio  # noqa: E402

from app.database.session import get_engine, get_sessionmaker  # noqa: E402
from app.models import Base  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def _reset_db() -> AsyncIterator[None]:
    """Recreate the schema before each test (shared in-memory SQLite)."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    # Reset the in-memory vector store between tests.
    from app.retrieval.vector_store import get_vector_store

    get_vector_store.cache_clear()
    yield


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[object]:
    """A single AsyncSession for tests that only need one."""
    async with get_sessionmaker()() as session:
        yield session
