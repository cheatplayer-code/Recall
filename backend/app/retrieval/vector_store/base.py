"""VectorStore interface + shared record/hit types."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class VectorRecord:
    """A vector plus the metadata that makes it filterable and citable."""

    id: str
    vector: list[float]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class SearchHit:
    """A single search result: id, similarity score (higher = closer), metadata."""

    id: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)


class VectorStore(ABC):
    """Interface over the vector database. Vectors never live in Postgres tables."""

    @abstractmethod
    async def create_collection(self, dimension: int) -> None:
        """Ensure backing storage exists for vectors of the given dimension."""

    @abstractmethod
    async def upsert_embeddings(self, records: list[VectorRecord]) -> None:
        """Insert or update vectors keyed by ``record.id``."""

    @abstractmethod
    async def delete_embeddings(self, flt: dict[str, Any]) -> int:
        """Delete vectors whose metadata matches the filter. Returns count removed."""

    @abstractmethod
    async def search(
        self,
        query_vector: list[float],
        top_k: int,
        flt: dict[str, Any] | None = None,
    ) -> list[SearchHit]:
        """Return the ``top_k`` nearest vectors (cosine), filtered by metadata."""

    @abstractmethod
    async def health(self) -> bool:
        """Return True if the backend is reachable/usable."""
