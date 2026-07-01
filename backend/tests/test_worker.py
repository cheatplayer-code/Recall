"""ProcessingWorker drives a job to READY end-to-end (deterministic backends).

Sessions are opened/closed sequentially (never two at once) because the shared
in-memory SQLite uses a single connection.
"""

from __future__ import annotations

from app.database.session import get_sessionmaker
from app.models.enums import KnowledgeStatus, ProcessingStatus
from app.models.jobs import DocumentProcessingJob
from app.models.knowledge import KnowledgeItem
from app.retrieval.embedder import get_embedder
from app.retrieval.vector_store import get_vector_store
from app.workers.worker import ProcessingWorker
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def _seed() -> tuple[str, str]:
    sm = get_sessionmaker()
    async with sm() as session:
        user = await make_user(session)
        ws = await make_workspace(session, user)
        item = await make_item(session, user, ws, content="alpha beta gamma " * 100)
        _, job = await make_processing_job(session, item, user)
        await session.commit()
        return str(item.id), str(user.id)


async def test_worker_processes_to_ready() -> None:
    item_id, user_id = await _seed()

    worker = ProcessingWorker(worker_id="test-worker")
    processed = await worker.process_next()
    assert processed is True

    sm = get_sessionmaker()
    async with sm() as session:
        import uuid

        item = await session.get(KnowledgeItem, uuid.UUID(item_id))
        assert item.status == KnowledgeStatus.READY.value
        assert item.chunk_count > 0

        from app.repositories.jobs import DocumentProcessingJobRepository

        job = await DocumentProcessingJobRepository(session).get_by_knowledge_item(item.id)
        assert job.status == ProcessingStatus.READY.value
        assert job.progress == 100.0

    # Vectors were indexed and are searchable for this user.
    hits = await get_vector_store().search(
        get_embedder().embed_texts(["alpha beta"])[0],
        top_k=5,
        flt={"user_id": user_id},
    )
    assert hits


async def test_worker_empty_queue_returns_false() -> None:
    worker = ProcessingWorker(worker_id="idle-worker")
    assert await worker.process_next() is False


async def test_worker_retries_on_stage_failure(monkeypatch) -> None:
    item_id, _ = await _seed()

    # Force the embed stage to fail so the retry path runs.
    from app.workers.processor import DocumentProcessor

    async def boom(self, ctx):  # noqa: ANN001, ANN202
        raise RuntimeError("model exploded")

    monkeypatch.setattr(DocumentProcessor, "embed", boom)

    worker = ProcessingWorker(worker_id="retry-worker")
    await worker.process_next()

    sm = get_sessionmaker()
    async with sm() as session:
        import uuid

        from app.repositories.jobs import DocumentProcessingJobRepository

        job = await DocumentProcessingJobRepository(session).get_by_knowledge_item(
            uuid.UUID(item_id)
        )
        # First failure → re-queued with a retry count and backoff timestamp.
        assert job.retry_count == 1
        assert job.status == ProcessingStatus.QUEUED.value
        assert job.next_retry_at is not None
        assert "model exploded" in (job.error or "")
