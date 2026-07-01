"""All models can be created and persisted."""

from __future__ import annotations

from app.models.chat import Conversation, Message
from app.models.chunk import Embedding, KnowledgeChunk
from app.models.search import SearchSession
from tests.factories import make_item, make_processing_job, make_user, make_workspace


async def test_full_object_graph(db_session) -> None:
    user = await make_user(db_session)
    ws = await make_workspace(db_session, user)
    item = await make_item(db_session, user, ws)
    upload, job = await make_processing_job(db_session, item, user)

    chunk = KnowledgeChunk(
        knowledge_item_id=item.id, chunk_index=0, text="chunk text", meta={"k": "v"}
    )
    db_session.add(chunk)
    await db_session.flush()

    emb = Embedding(
        chunk_id=chunk.id, provider="deterministic", model="m", model_version="v1", dimension=256
    )
    conv = Conversation(user_id=user.id, title="c", attached_memory_ids=[str(item.id)])
    db_session.add_all([emb, conv])
    await db_session.flush()

    msg = Message(conversation_id=conv.id, role="user", content="hi")
    sess = SearchSession(user_id=user.id, query="q", filters={}, result_count=0)
    db_session.add_all([msg, sess])
    await db_session.commit()

    assert item.id and job.upload_job_id == upload.id
    assert chunk.meta == {"k": "v"}  # column "metadata" maps to attr "meta"
    assert emb.model_version == "v1"


async def test_soft_delete_flag(db_session) -> None:
    user = await make_user(db_session, email="sd@example.com")
    ws = await make_workspace(db_session, user)
    item = await make_item(db_session, user, ws)
    assert item.is_deleted is False
    item.is_deleted = True
    await db_session.commit()
    assert item.is_deleted is True
