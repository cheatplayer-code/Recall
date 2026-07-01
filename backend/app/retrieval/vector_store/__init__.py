"""VectorStore seam: interface, in-memory + pgvector backends, and selector."""

from __future__ import annotations

from functools import lru_cache

from app.core.config.settings import get_settings
from app.retrieval.vector_store.base import SearchHit, VectorRecord, VectorStore
from app.retrieval.vector_store.memory_vector_store import MemoryVectorStore

__all__ = [
    "VectorStore",
    "VectorRecord",
    "SearchHit",
    "MemoryVectorStore",
    "get_vector_store",
]


@lru_cache
def get_vector_store() -> VectorStore:
    """Return the process-wide vector store selected by settings."""
    settings = get_settings()
    backend = settings.vector_store_backend
    if backend == "memory":
        return MemoryVectorStore()
    if backend == "pgvector":
        # Imported lazily so the pgvector extra is only required when selected.
        from app.retrieval.vector_store.pgvector_store import PgVectorStore  # noqa: PLC0415

        return PgVectorStore(dimension=settings.vector_dimension)
    raise ValueError(f"Unknown vector_store_backend: {backend!r}")
