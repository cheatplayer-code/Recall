"""Search / retrieval schemas (the contract real semantic search fills)."""

from __future__ import annotations

import uuid

from app.schemas.common import CamelModel


class RetrievalRequest(CamelModel):
    query: str
    filters: dict | None = None
    limit: int | None = None
    offset: int = 0
    cursor: str | None = None


class SimilarRequest(CamelModel):
    chunk_id: uuid.UUID | None = None
    document_id: uuid.UUID | None = None
    limit: int | None = None


class RelatedRequest(CamelModel):
    document_id: uuid.UUID
    limit: int | None = None


class Citation(CamelModel):
    chunk_id: str
    knowledge_item_id: str
    document_title: str | None = None
    snippet: str | None = None
    score: float
    chunk_index: int | None = None
    page_number: int | None = None


class RetrievalMetrics(CamelModel):
    retrieval_latency_ms: float = 0.0
    vector_latency_ms: float = 0.0
    rerank_latency_ms: float = 0.0
    returned_count: int = 0
    candidate_count: int = 0
    # Additive hybrid-search metrics (optional, defaulted → backward compatible;
    # existing clients ignore unknown camelCase fields).
    hybrid_latency_ms: float = 0.0
    lexical_count: int = 0
    vector_count: int = 0


class RetrievalResponse(CamelModel):
    query: str
    citations: list[Citation] = []
    scores: list[float] = []
    metrics: RetrievalMetrics = RetrievalMetrics()
    next_cursor: str | None = None


class SearchResultItem(CamelModel):
    kind: str
    knowledge_item_id: str
    title: str
    excerpt: str | None = None
    thumbnail_url: str | None = None
    score: float


class SearchResponse(CamelModel):
    query: str
    results: list[SearchResultItem] = []


class SearchHistoryItem(CamelModel):
    id: uuid.UUID
    query: str
    result_count: int
    latency_ms: float
