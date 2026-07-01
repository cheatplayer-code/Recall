"""DocumentProcessor stage behaviour (deterministic backends)."""

from __future__ import annotations

from sqlalchemy import select

from app.core.config.settings import get_settings
from app.models.chunk import Embedding
from app.repositories.retrieval import KnowledgeChunkRepository
from app.retrieval.embedder import get_embedder
from app.retrieval.vector_store import get_vector_store
from app.workers.processor import DocumentProcessor, ProcessingContext
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def _make_ctx(session):  # noqa: ANN001
    user = await make_user(session)
    ws = await make_workspace(session, user)
    item = await make_item(
        session, user, ws, content="The mitochondria is the powerhouse of the cell. " * 200
    )
    upload, job = await make_processing_job(session, item, user)
    await session.commit()
    ctx = ProcessingContext(
        job=job,
        item=item,
        upload=upload,
        session=session,
        embedder=get_embedder(),
        vector_store=get_vector_store(),
        settings=get_settings(),
    )
    return ctx


async def test_extract_chunk_embed_index(db_session) -> None:
    proc = DocumentProcessor()
    ctx = await _make_ctx(db_session)

    extract = await proc.extract(ctx)
    for k, v in extract.items():
        setattr(ctx.item, k, v)
    assert ctx.item.content
    assert ctx.item.excerpt

    chunk_updates = await proc.chunk(ctx)
    await db_session.commit()
    assert chunk_updates["chunk_count"] > 1
    ctx.item.chunk_count = chunk_updates["chunk_count"]

    chunks = await KnowledgeChunkRepository(db_session).list_by_knowledge_item(ctx.item.id)
    assert len(chunks) == chunk_updates["chunk_count"]

    await proc.embed(ctx)
    await db_session.commit()
    # Vectors landed in the store, scoped to the user.
    hits = await get_vector_store().search(
        get_embedder().embed_texts(["powerhouse of the cell"])[0],
        top_k=3,
        flt={"user_id": str(ctx.item.user_id)},
    )
    assert hits

    await proc.index(ctx)
    await db_session.commit()
    embs = (await db_session.execute(select(Embedding))).scalars().all()
    assert len(embs) == len(chunks)
    assert all(e.model_version == get_embedder().version for e in embs)


async def test_chunk_overlap_splitting(db_session) -> None:
    proc = DocumentProcessor()
    ctx = await _make_ctx(db_session)
    ctx.settings.chunk_char_size = 100
    ctx.settings.chunk_overlap = 20
    await proc.chunk(ctx)
    await db_session.commit()
    chunks = await KnowledgeChunkRepository(db_session).list_by_knowledge_item(ctx.item.id)
    assert len(chunks) > 1
    # Overlap means consecutive chunks share a boundary region.
    assert chunks[0].text[-20:] == chunks[1].text[:20]
