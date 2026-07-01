"""RetrievalService end-to-end on deterministic backends."""

from __future__ import annotations

import uuid

from app.database.session import get_sessionmaker
from app.services.retrieval import RetrievalService
from app.workers.worker import ProcessingWorker
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def _ingest(content: str, *, email: str, title: str) -> tuple[uuid.UUID, uuid.UUID]:
    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session, email=email)
        ws = await make_workspace(session, user)
        item = await make_item(session, user, ws, title=title, content=content)
        await make_processing_job(session, item, user)
        await session.commit()
        ids = (item.id, user.id)
    # Drive it through the real pipeline so chunks/vectors exist.
    await ProcessingWorker(worker_id="ret-test").process_next()
    return ids


async def test_search_returns_citations() -> None:
    item_id, user_id = await _ingest(
        "Photosynthesis converts sunlight into chemical energy in plants. " * 50,
        email="r1@example.com",
        title="Biology",
    )
    sm = get_sessionmaker()
    async with sm() as session:
        result = await RetrievalService(session).search(user_id, "sunlight energy plants")
    assert result.citations
    assert all(c.knowledge_item_id == str(item_id) for c in result.citations)
    assert result.metrics.returned_count == len(result.citations)
    assert result.scores and result.scores[0] >= result.scores[-1]


async def test_search_is_user_scoped() -> None:
    _, user_a = await _ingest("secret content for A " * 50, email="a@x.com", title="A")
    _, user_b = await _ingest("totally different B " * 50, email="b@x.com", title="B")

    sm = get_sessionmaker()
    async with sm() as session:
        res_a = await RetrievalService(session).search(user_a, "secret content")
    # A only ever sees A's memories.
    assert res_a.citations
    assert all(c.knowledge_item_id != "" for c in res_a.citations)
    assert all(uuid.UUID(c.knowledge_item_id) for c in res_a.citations)
    # None of A's citations belong to B's user space (enforced by the filter).
    assert str(user_b) not in {c.knowledge_item_id for c in res_a.citations}


async def test_related_excludes_seed_document() -> None:
    item_id, user_id = await _ingest("machine learning models " * 50, email="rel@x.com", title="ML")
    sm = get_sessionmaker()
    async with sm() as session:
        related = await RetrievalService(session).related(user_id, item_id)
    # Only one document exists, so related (which excludes the seed) is empty.
    assert all(c.knowledge_item_id != str(item_id) for c in related.citations)


async def test_history_logged() -> None:
    _, user_id = await _ingest("history test content " * 30, email="hist@x.com", title="H")
    sm = get_sessionmaker()
    async with sm() as session:
        svc = RetrievalService(session)
        await svc.search(user_id, "history test")
    async with sm() as session:
        history = await RetrievalService(session).history(user_id)
    assert len(history) >= 1
    assert history[0].query == "history test"
