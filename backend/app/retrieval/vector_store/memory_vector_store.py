"""In-memory VectorStore for dev and tests.

Stores vectors in a dict and does brute-force cosine similarity. Vectors are
assumed (but not required) to be L2-normalized; cosine is computed explicitly so
both normalized and unnormalized inputs work.
"""

from __future__ import annotations

import math
import threading
from typing import Any

import structlog

from app.retrieval.metadata import matches_filter
from app.retrieval.vector_store.base import SearchHit, VectorRecord, VectorStore

logger = structlog.get_logger(__name__)


class MemoryVectorStore(VectorStore):
    def __init__(self) -> None:
        self._records: dict[str, VectorRecord] = {}
        self._dimension: int | None = None
        self._lock = threading.Lock()

    async def create_collection(self, dimension: int) -> None:
        with self._lock:
            if self._dimension is None:
                self._dimension = dimension
                logger.info("memory_vector_store.create_collection", dimension=dimension)

    async def upsert_embeddings(self, records: list[VectorRecord]) -> None:
        with self._lock:
            for record in records:
                self._records[record.id] = record

    async def delete_embeddings(self, flt: dict[str, Any]) -> int:
        with self._lock:
            to_remove = [
                rid for rid, rec in self._records.items()
                if matches_filter(rec.metadata, flt)
            ]
            for rid in to_remove:
                del self._records[rid]
        return len(to_remove)

    async def search(
        self,
        query_vector: list[float],
        top_k: int,
        flt: dict[str, Any] | None = None,
    ) -> list[SearchHit]:
        flt = flt or {}
        with self._lock:
            candidates = [
                rec for rec in self._records.values()
                if matches_filter(rec.metadata, flt)
            ]
        scored = [
            SearchHit(
                id=rec.id,
                score=_cosine(query_vector, rec.vector),
                metadata=rec.metadata,
            )
            for rec in candidates
        ]
        scored.sort(key=lambda hit: hit.score, reverse=True)
        return scored[:top_k]

    async def health(self) -> bool:
        return True


def _cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b, strict=False))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)
