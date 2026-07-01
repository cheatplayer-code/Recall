"""RetrievalService — query embedding + vector search + citation assembly.

This is non-ML orchestration: it embeds the query with the configured embedder,
filters by user (always) via the metadata DSL, calls the VectorStore, and shapes
the stable ``RetrievalResponse``. Swapping in real embeddings + pgvector turns it
into real semantic search with no change here.
"""

from __future__ import annotations

import base64
import time
import uuid
from typing import Any

import structlog
from sqlalchemy import or_, select

from app.core.config.settings import Settings, get_settings
from app.core.errors import NotFoundError
from app.models.knowledge import KnowledgeItem
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.retrieval import KnowledgeChunkRepository, SearchRepository
from app.retrieval.embedder import EmbeddingProvider, get_embedder
from app.retrieval.metadata import build_filter
from app.retrieval.reranker import RerankerProvider, get_reranker
from app.retrieval.vector_store import VectorStore, get_vector_store
from app.retrieval.vector_store.base import SearchHit
from app.schemas.search import (
    Citation,
    RetrievalMetrics,
    RetrievalResponse,
    SearchHistoryItem,
)

logger = structlog.get_logger(__name__)


class RetrievalService:
    def __init__(
        self,
        session,  # noqa: ANN001
        embedder: EmbeddingProvider | None = None,
        vector_store: VectorStore | None = None,
        settings: Settings | None = None,
        reranker: RerankerProvider | None = None,
    ) -> None:
        self.session = session
        self.embedder = embedder or get_embedder()
        self.vector_store = vector_store or get_vector_store()
        self.settings = settings or get_settings()
        self.reranker = reranker or get_reranker(self.settings)
        self.chunks = KnowledgeChunkRepository(session)
        self.knowledge = KnowledgeRepository(session)
        self.search_repo = SearchRepository(session)

    # -- public API -------------------------------------------------------
    async def search(
        self,
        user_id: uuid.UUID,
        query: str,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
        offset: int = 0,
        cursor: str | None = None,
    ) -> RetrievalResponse:
        # Hybrid path (lexical + vector + RRF + optional rerank) when enabled and
        # not paginating; otherwise the original vector-only path (keeps cursor
        # pagination intact).
        if self.settings.hybrid_enabled and not cursor and offset == 0:
            return await self.hybrid_search(user_id, query, filters, limit)

        offset = _decode_cursor(cursor) if cursor else offset
        top_k = limit or self.settings.retrieval_top_k
        flt = build_filter(user_id, filters)

        t0 = time.perf_counter()
        query_vector = self.embedder.embed_texts([query])[0]
        t_embed = time.perf_counter()
        hits = await self.vector_store.search(query_vector, top_k + offset, flt)
        t_search = time.perf_counter()

        window = hits[offset : offset + top_k]
        response = self._to_response(
            query,
            window,
            candidate_count=len(hits),
            vector_latency_ms=(t_search - t_embed) * 1000,
            retrieval_latency_ms=(t_search - t0) * 1000,
            next_offset=offset + top_k if len(hits) > offset + top_k else None,
        )
        await self.search_repo.log_search(
            user_id, query, filters or {}, response.metrics.retrieval_latency_ms, len(window)
        )
        await self.session.commit()
        return response

    async def lexical_search(
        self,
        user_id: uuid.UUID,
        query: str,
        limit: int,
        filters: dict[str, Any] | None = None,
    ) -> RetrievalResponse:
        """Keyword search over items, returned in the RetrievalResponse shape.

        Same signal the GET /search endpoint uses, exposed here so it can be
        fused with vector results. Item-level (chunk_id empty); snippet is the
        item excerpt/content.
        """
        pattern = f"%{query}%"
        conditions = [
            KnowledgeItem.user_id == user_id,
            KnowledgeItem.is_deleted.is_(False),
            or_(
                KnowledgeItem.title.ilike(pattern),
                KnowledgeItem.content.ilike(pattern),
                KnowledgeItem.excerpt.ilike(pattern),
            ),
        ]
        if filters:
            if (workspace_id := filters.get("workspace_id")) is not None:
                conditions.append(KnowledgeItem.workspace_id == workspace_id)
            if (type_ := filters.get("type")) is not None:
                conditions.append(KnowledgeItem.type == type_)
        stmt = select(KnowledgeItem).where(*conditions).limit(limit)
        items = (await self.session.execute(stmt)).scalars().all()
        citations = [
            Citation(
                chunk_id="",
                knowledge_item_id=str(item.id),
                document_title=item.title,
                snippet=item.excerpt or (item.content or "")[:280],
                score=1.0,
            )
            for item in items
        ]
        return RetrievalResponse(
            query=query,
            citations=citations,
            scores=[1.0] * len(citations),
            metrics=RetrievalMetrics(returned_count=len(citations)),
        )

    async def hybrid_search(
        self,
        user_id: uuid.UUID,
        query: str,
        filters: dict[str, Any] | None = None,
        top_k: int | None = None,
    ) -> RetrievalResponse:
        """Lexical + vector retrieval fused by RRF, then optionally reranked.

        Candidates are fused at the document (``knowledge_item_id``) level — the
        common key between item-level lexical hits and chunk-level vector hits —
        so a document appearing in both lists gets the RRF bonus.
        """
        top_k = top_k or self.settings.retrieval_top_k
        pool = self.settings.retrieval_top_k_hybrid
        t0 = time.perf_counter()

        # 1) vector search
        flt = build_filter(user_id, filters)
        query_vector = self.embedder.embed_texts([query])[0]
        tv0 = time.perf_counter()
        vector_hits = await self.vector_store.search(query_vector, pool, flt)
        vector_latency_ms = (time.perf_counter() - tv0) * 1000

        # 2) lexical search
        lexical = await self.lexical_search(user_id, query, pool, filters)

        # 3) build per-source ranked key lists + a representative citation per key
        #    (vector citation preferred — it carries chunk-level snippet/page).
        citation_by_key: dict[str, Citation] = {}
        vector_keys: list[str] = []
        for hit in vector_hits:
            key = str(hit.metadata.get("knowledge_item_id") or "")
            if not key:
                continue
            citation_by_key.setdefault(key, _citation_from_hit(hit))
            vector_keys.append(key)
        lexical_keys: list[str] = []
        for citation in lexical.citations:
            key = citation.knowledge_item_id
            lexical_keys.append(key)
            citation_by_key.setdefault(key, citation)

        fused = _rrf_fuse(
            [_dedupe_preserve(vector_keys), _dedupe_preserve(lexical_keys)],
            self.settings.rrf_k,
        )
        ordered = sorted(fused.items(), key=lambda kv: kv[1], reverse=True)
        candidates: list[tuple[str, float, Citation]] = [
            (key, score, citation_by_key[key]) for key, score in ordered if key in citation_by_key
        ]

        # 4) optional cross-encoder rerank of the top slice
        rerank_latency_ms = 0.0
        if self.settings.reranker_backend != "noop" and candidates:
            head = candidates[: self.settings.rerank_top_k]
            passages = [cite.snippet or cite.document_title or "" for _, _, cite in head]
            tr0 = time.perf_counter()
            order = await self.reranker.rerank(query, passages, len(head))
            rerank_latency_ms = (time.perf_counter() - tr0) * 1000
            reranked = [(head[i][0], score, head[i][2]) for i, score in order]
            candidates = reranked + candidates[self.settings.rerank_top_k :]

        # 5) slice + assemble citations with final scores
        final = candidates[:top_k]
        citations = [
            citation.model_copy(update={"score": score}) for _, score, citation in final
        ]
        total_latency_ms = (time.perf_counter() - t0) * 1000
        response = RetrievalResponse(
            query=query,
            citations=citations,
            scores=[score for _, score, _ in final],
            metrics=RetrievalMetrics(
                retrieval_latency_ms=total_latency_ms,
                hybrid_latency_ms=total_latency_ms,
                vector_latency_ms=vector_latency_ms,
                rerank_latency_ms=rerank_latency_ms,
                lexical_count=len(lexical.citations),
                vector_count=len(vector_hits),
                returned_count=len(citations),
                candidate_count=len(candidates),
            ),
            next_cursor=None,
        )
        await self.search_repo.log_search(
            user_id, query, filters or {}, total_latency_ms, len(citations)
        )
        await self.session.commit()
        return response

    async def similar(
        self,
        user_id: uuid.UUID,
        chunk_id: uuid.UUID | None = None,
        document_id: uuid.UUID | None = None,
        limit: int | None = None,
    ) -> RetrievalResponse:
        if chunk_id is not None:
            chunk = await self.chunks.get_owned(chunk_id)
            if chunk is None:
                raise NotFoundError("Chunk not found.")
            seed_text = chunk.text
            exclude_item = str(chunk.knowledge_item_id)
            label = f"similar:{chunk_id}"
        elif document_id is not None:
            item = await self._owned_item(document_id, user_id)
            seed_text = item.content or item.title
            exclude_item = str(item.id)
            label = f"similar:{document_id}"
        else:
            raise NotFoundError("Provide chunkId or documentId.")
        return await self._search_by_text(user_id, label, seed_text, limit, exclude_item)

    async def related(
        self, user_id: uuid.UUID, document_id: uuid.UUID, limit: int | None = None
    ) -> RetrievalResponse:
        item = await self._owned_item(document_id, user_id)
        seed_text = item.content or item.title
        return await self._search_by_text(
            user_id, f"related:{document_id}", seed_text, limit, str(item.id)
        )

    async def history(self, user_id: uuid.UUID, limit: int = 20) -> list[SearchHistoryItem]:
        sessions = await self.search_repo.recent(user_id, limit)
        return [
            SearchHistoryItem(
                id=s.id, query=s.query, result_count=s.result_count, latency_ms=s.latency_ms
            )
            for s in sessions
        ]

    async def get_chunk_text(self, chunk_id: uuid.UUID) -> str:
        chunk = await self.chunks.get_owned(chunk_id)
        if chunk is None:
            raise NotFoundError("Chunk not found.")
        return chunk.text

    async def debug(
        self, user_id: uuid.UUID, query: str, filters: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        flt = build_filter(user_id, filters)
        query_vector = self.embedder.embed_texts([query])[0]
        hits = await self.vector_store.search(query_vector, self.settings.retrieval_top_k, flt)
        return {
            "query": query,
            "filter": flt,
            "embedder": {
                "provider": self.embedder.provider,
                "model": self.embedder.model,
                "dimension": self.embedder.dimension,
            },
            "hits": [{"id": h.id, "score": h.score} for h in hits],
        }

    async def purge_document(self, document_id: uuid.UUID) -> int:
        return await self.vector_store.delete_embeddings(
            {"knowledge_item_id": str(document_id)}
        )

    # -- internals --------------------------------------------------------
    async def _owned_item(
        self, item_id: uuid.UUID, user_id: uuid.UUID
    ) -> KnowledgeItem:
        item = await self.knowledge.get_owned(item_id, user_id)
        if item is None:
            raise NotFoundError("Memory not found.")
        return item

    async def _search_by_text(
        self,
        user_id: uuid.UUID,
        label: str,
        text: str,
        limit: int | None,
        exclude_item_id: str | None,
    ) -> RetrievalResponse:
        top_k = limit or self.settings.retrieval_top_k
        flt = build_filter(user_id)
        t0 = time.perf_counter()
        query_vector = self.embedder.embed_texts([text])[0]
        # Over-fetch so we can drop the seed document and still return top_k.
        hits = await self.vector_store.search(query_vector, top_k + 5, flt)
        if exclude_item_id is not None:
            hits = [h for h in hits if h.metadata.get("knowledge_item_id") != exclude_item_id]
        hits = hits[:top_k]
        elapsed = (time.perf_counter() - t0) * 1000
        return self._to_response(
            label, hits, candidate_count=len(hits), vector_latency_ms=elapsed,
            retrieval_latency_ms=elapsed, next_offset=None,
        )

    def _to_response(
        self,
        query: str,
        hits: list[SearchHit],
        *,
        candidate_count: int,
        vector_latency_ms: float,
        retrieval_latency_ms: float,
        next_offset: int | None,
    ) -> RetrievalResponse:
        citations = [_citation_from_hit(hit) for hit in hits]
        return RetrievalResponse(
            query=query,
            citations=citations,
            scores=[hit.score for hit in hits],
            metrics=RetrievalMetrics(
                retrieval_latency_ms=retrieval_latency_ms,
                vector_latency_ms=vector_latency_ms,
                rerank_latency_ms=0.0,
                returned_count=len(hits),
                candidate_count=candidate_count,
            ),
            next_cursor=_encode_cursor(next_offset) if next_offset is not None else None,
        )


def _citation_from_hit(hit: SearchHit) -> Citation:
    return Citation(
        chunk_id=str(hit.metadata.get("chunk_id", hit.id)),
        knowledge_item_id=str(hit.metadata.get("knowledge_item_id", "")),
        document_title=hit.metadata.get("title"),
        snippet=hit.metadata.get("text"),
        score=hit.score,
        chunk_index=hit.metadata.get("chunk_index"),
        page_number=hit.metadata.get("page_number"),
    )


def _dedupe_preserve(keys: list[str]) -> list[str]:
    """Unique keys in first-seen order (so each key keeps its best rank)."""
    seen: set[str] = set()
    out: list[str] = []
    for key in keys:
        if key not in seen:
            seen.add(key)
            out.append(key)
    return out


def _rrf_fuse(ranked_lists: list[list[str]], k: int) -> dict[str, float]:
    """Reciprocal Rank Fusion: score(d) = Σ 1 / (k + rank_i), rank 1-based.

    A key appearing in multiple lists accumulates contributions, so documents
    found by both lexical and vector retrieval rank above single-source ones.
    """
    scores: dict[str, float] = {}
    for ranked in ranked_lists:
        for rank, key in enumerate(ranked):
            scores[key] = scores.get(key, 0.0) + 1.0 / (k + rank + 1)
    return scores


def _encode_cursor(offset: int) -> str:
    return base64.urlsafe_b64encode(str(offset).encode()).decode()


def _decode_cursor(cursor: str) -> int:
    try:
        return int(base64.urlsafe_b64decode(cursor.encode()).decode())
    except (ValueError, TypeError):
        return 0
