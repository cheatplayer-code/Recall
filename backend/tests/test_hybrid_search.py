"""Hybrid search (RRF fusion) + cross-encoder reranker.

All tests use DeterministicEmbedder + MemoryVectorStore (no GPU/network).
"""

from __future__ import annotations

import uuid

import pytest

from app.core.config.settings import get_settings
from app.database.session import get_sessionmaker
from app.retrieval import reranker as reranker_module
from app.retrieval.reranker import CrossEncoderReranker, NoopReranker, get_reranker
from app.services.retrieval import RetrievalService, _dedupe_preserve, _rrf_fuse
from app.workers.worker import ProcessingWorker
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def _ingest(session, user, ws, *, title: str, content: str):
    item = await make_item(session, user, ws, title=title, content=content)
    await make_processing_job(session, item, user)
    await session.commit()
    await ProcessingWorker(worker_id="hybrid-test").process_next()
    return item.id


# --- 1. pure RRF fusion --------------------------------------------------
def test_rrf_fusion_pure() -> None:
    vector = ["a", "b", "c"]
    lexical = ["b", "d"]
    scores = _rrf_fuse([vector, lexical], k=60)
    # "b" appears in both lists → highest fused score.
    assert max(scores, key=scores.__getitem__) == "b"
    assert scores["b"] > scores["a"]
    assert scores["b"] > scores["d"]
    # Single-list members ranked by their position.
    assert scores["a"] > scores["c"]

    assert _dedupe_preserve(["x", "x", "y", "x"]) == ["x", "y"]


# --- 2 & 3. one-sided fusion --------------------------------------------
async def test_rrf_empty_lexical() -> None:
    """Vector-only still works when the lexical query matches nothing."""
    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session, email="el@x.com")
        ws = await make_workspace(session, user)
        item_id = await _ingest(
            session, user, ws, title="Astro", content="nebulae and stellar nurseries " * 30
        )
    async with sm() as session:
        # A query whose exact substring never appears in title/content/excerpt.
        result = await RetrievalService(session).hybrid_search(user.id, "zzzznomatch")
    assert result.metrics.lexical_count == 0
    assert result.metrics.vector_count > 0
    assert result.citations
    assert all(c.knowledge_item_id == str(item_id) for c in result.citations)


async def test_rrf_empty_vector() -> None:
    """Lexical-only still works when no vectors exist for the user."""
    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session, email="ev@x.com")
        ws = await make_workspace(session, user)
        # Create the item WITHOUT running the worker → no vectors are indexed.
        item = await make_item(
            session, user, ws, title="Recipes", content="sourdough bread baking guide"
        )
        await session.commit()
        item_id = item.id
    async with sm() as session:
        result = await RetrievalService(session).hybrid_search(user.id, "sourdough bread")
    assert result.metrics.vector_count == 0
    assert result.metrics.lexical_count > 0
    assert any(c.knowledge_item_id == str(item_id) for c in result.citations)


# --- 4. noop reranker ----------------------------------------------------
async def test_noop_reranker() -> None:
    noop = NoopReranker()
    order = await noop.rerank("q", ["p0", "p1", "p2"], top_k=3)
    assert order == [(0, 1.0), (1, 1.0), (2, 1.0)]
    # Respects top_k truncation.
    assert await noop.rerank("q", ["a", "b", "c"], top_k=2) == [(0, 1.0), (1, 1.0)]


# --- 5. cross-encoder reranker (monkeypatched) --------------------------
async def test_cross_encoder_reranker(monkeypatch) -> None:
    class FakeCrossEncoder:
        # Score ascending by index → reranker should reverse the head order.
        def predict(self, pairs):  # noqa: ANN001, ANN202
            return [float(i) for i in range(len(pairs))]

    monkeypatch.setattr(reranker_module, "_get_cross_encoder", lambda name: FakeCrossEncoder())

    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session, email="ce@x.com")
        ws = await make_workspace(session, user)
        for n in range(3):
            await _ingest(session, user, ws, title=f"Doc{n}", content=f"topic number {n} " * 30)

    base_settings = get_settings()
    async with sm() as session:
        noop_result = await RetrievalService(
            session, settings=base_settings.model_copy(update={"reranker_backend": "noop"})
        ).hybrid_search(user.id, "topic number")
    noop_order = [c.knowledge_item_id for c in noop_result.citations]

    ce_settings = base_settings.model_copy(update={"reranker_backend": "cross_encoder"})
    async with sm() as session:
        ce_result = await RetrievalService(session, settings=ce_settings).hybrid_search(
            user.id, "topic number"
        )
    ce_order = [c.knowledge_item_id for c in ce_result.citations]

    assert len(ce_order) == len(noop_order) >= 2
    # FakeCrossEncoder reverses the candidate head.
    assert ce_order == list(reversed(noop_order))
    assert ce_result.metrics.rerank_latency_ms >= 0.0


def test_get_reranker_selection() -> None:
    settings = get_settings()
    assert isinstance(get_reranker(settings.model_copy(update={"reranker_backend": "noop"})), NoopReranker)
    assert isinstance(
        get_reranker(settings.model_copy(update={"reranker_backend": "cross_encoder"})),
        CrossEncoderReranker,
    )


# --- 6. metrics ----------------------------------------------------------
async def test_metrics_populated() -> None:
    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session, email="m@x.com")
        ws = await make_workspace(session, user)
        await _ingest(
            session, user, ws, title="Climate", content="climate change mitigation strategies " * 30
        )
    async with sm() as session:
        result = await RetrievalService(session).hybrid_search(user.id, "climate change")
    m = result.metrics
    assert m.hybrid_latency_ms > 0.0
    assert m.retrieval_latency_ms > 0.0
    assert m.vector_count > 0
    assert m.lexical_count > 0
    assert m.returned_count == len(result.citations)
    assert m.candidate_count >= m.returned_count
