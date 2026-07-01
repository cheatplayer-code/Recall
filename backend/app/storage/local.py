"""Local-disk StorageProvider. Blocks path traversal; runs IO off the event loop."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

from app.storage.base import StorageProvider


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str, public_url: str | None = None) -> None:
        self._base = Path(base_dir).resolve()
        self._base.mkdir(parents=True, exist_ok=True)
        self._public_url = public_url.rstrip("/") if public_url else None

    def _resolve(self, key: str) -> Path:
        # Reject absolute paths / traversal before resolving.
        candidate = (self._base / key).resolve()
        if not str(candidate).startswith(str(self._base)):
            raise ValueError(f"Path traversal blocked for key: {key!r}")
        return candidate

    async def save(self, key: str, data: bytes) -> None:
        path = self._resolve(key)

        def _write() -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        await asyncio.to_thread(_write)

    async def read(self, key: str) -> bytes:
        path = self._resolve(key)
        return await asyncio.to_thread(path.read_bytes)

    async def delete(self, key: str) -> None:
        path = self._resolve(key)

        def _delete() -> None:
            if path.exists():
                path.unlink()

        await asyncio.to_thread(_delete)

    async def exists(self, key: str) -> bool:
        return await asyncio.to_thread(self._resolve(key).exists)

    async def list_keys(self, prefix: str = "") -> list[str]:
        def _list() -> list[str]:
            root = self._base
            return [
                str(p.relative_to(root)).replace(os.sep, "/")
                for p in root.rglob("*")
                if p.is_file() and str(p.relative_to(root)).replace(os.sep, "/").startswith(prefix)
            ]

        return await asyncio.to_thread(_list)

    def url_for(self, key: str) -> str | None:
        if self._public_url is None:
            return None
        return f"{self._public_url}/{key}"
