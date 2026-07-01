"""End-to-end API flow: register → upload → process → vector search."""

from __future__ import annotations

import httpx

from app.workers.worker import ProcessingWorker

_CONTENT = b"Quantum entanglement links particles across vast distances. " * 60


def _client() -> httpx.AsyncClient:
    from app.main import app

    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    )


async def test_register_upload_process_search() -> None:
    async with _client() as client:
        reg = await client.post(
            "/api/v1/auth/register",
            json={"email": "api@example.com", "password": "password123", "fullName": "API"},
        )
        assert reg.status_code == 201, reg.text
        headers = {"Authorization": f"Bearer {reg.json()['accessToken']}"}

        workspaces = (await client.get("/api/v1/workspaces", headers=headers)).json()
        assert workspaces, "registration must auto-create a Personal workspace"
        ws_id = workspaces[0]["id"]
        assert workspaces[0]["name"] == "Personal"

        upload = await client.post(
            "/api/v1/documents",
            headers=headers,
            files={"file": ("note.txt", _CONTENT, "text/plain")},
            data={"workspaceId": ws_id},
        )
        assert upload.status_code == 201, upload.text
        item_id = upload.json()["item"]["id"]
        assert upload.json()["processingJob"]["status"] == "queued"

    # Drain the queue (the worker would do this out-of-process in prod).
    assert await ProcessingWorker(worker_id="api-test").process_next() is True

    async with _client() as client:
        status = await client.get(
            f"/api/v1/documents/{item_id}/status", headers=headers
        )
        assert status.json()["status"] == "ready"
        assert status.json()["progress"] == 1.0

        search = await client.post(
            "/api/v1/search",
            headers=headers,
            json={"query": "quantum entanglement particles"},
        )
        body = search.json()
        assert body["citations"], "vector search must return the uploaded document"
        assert any(c["knowledgeItemId"] == item_id for c in body["citations"])

        # Lexical search also finds it.
        lex = await client.get(
            "/api/v1/search", headers=headers, params={"query": "Quantum"}
        )
        assert any(r["knowledgeItemId"] == item_id for r in lex.json()["results"])


async def test_unauthorized_is_envelope() -> None:
    async with _client() as client:
        r = await client.get("/api/v1/knowledge")
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "unauthorized"
