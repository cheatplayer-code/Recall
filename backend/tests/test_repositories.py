"""Repository behaviour."""

from __future__ import annotations

from app.models.enums import KnowledgeType
from app.repositories.jobs import DocumentProcessingJobRepository
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.retrieval import EmbeddingRepository, KnowledgeChunkRepository
from app.repositories.user import (
    UserRepository,
    WorkspaceRepository,
)
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def test_user_get_by_email(db_session) -> None:
    user = await make_user(db_session, email="findme@example.com")
    await db_session.commit()
    found = await UserRepository(db_session).get_by_email("findme@example.com")
    assert found is not None and found.id == user.id


async def test_workspace_default(db_session) -> None:
    user = await make_user(db_session)
    await make_workspace(db_session, user, "Personal")
    await make_workspace(db_session, user, "Research")
    await db_session.commit()
    repo = WorkspaceRepository(db_session)
    assert len(await repo.list_for_user(user.id)) == 2
    default = await repo.get_default_for_user(user.id)
    assert default is not None and default.name == "Personal"


async def test_knowledge_filters(db_session) -> None:
    user = await make_user(db_session)
    ws = await make_workspace(db_session, user)
    await make_item(db_session, user, ws, title="a", type_=KnowledgeType.NOTE)
    pdf = await make_item(db_session, user, ws, title="b", type_=KnowledgeType.PDF)
    pdf.is_favorite = True
    await db_session.commit()

    repo = KnowledgeRepository(db_session)
    all_items = await repo.list_for_user(user.id)
    assert all_items.total == 2
    pdfs = await repo.list_for_user(user.id, type_="pdf")
    assert pdfs.total == 1 and pdfs.items[0].type == "pdf"
    favs = await repo.list_for_user(user.id, favorites_only=True)
    assert favs.total == 1 and favs.items[0].is_favorite is True


async def test_claim_next_job(db_session) -> None:
    user = await make_user(db_session)
    ws = await make_workspace(db_session, user)
    item = await make_item(db_session, user, ws)
    _, job = await make_processing_job(db_session, item, user)
    await db_session.commit()

    repo = DocumentProcessingJobRepository(db_session)
    claimed = await repo.claim_next_job("worker-1")
    assert claimed is not None and claimed.id == job.id
    assert claimed.worker_id == "worker-1"
    await db_session.commit()
    # Nothing left to claim.
    assert await repo.claim_next_job("worker-1") is None


async def test_chunk_and_embedding_bulk_create(db_session) -> None:
    user = await make_user(db_session)
    ws = await make_workspace(db_session, user)
    item = await make_item(db_session, user, ws)
    await db_session.commit()

    chunk_repo = KnowledgeChunkRepository(db_session)
    chunks = await chunk_repo.bulk_create(
        [
            {"knowledge_item_id": item.id, "chunk_index": i, "text": f"t{i}", "meta": {}}
            for i in range(3)
        ]
    )
    await db_session.commit()
    listed = await chunk_repo.list_by_knowledge_item(item.id)
    assert [c.chunk_index for c in listed] == [0, 1, 2]

    emb_repo = EmbeddingRepository(db_session)
    embs = await emb_repo.bulk_create(
        [
            {
                "chunk_id": c.id,
                "provider": "deterministic",
                "model": "m",
                "model_version": "v1",
                "dimension": 256,
            }
            for c in chunks
        ]
    )
    await db_session.commit()
    assert len(embs) == 3
