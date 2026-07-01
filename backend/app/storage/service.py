"""StorageService: checksums, collision-free keys, rich StoredFile metadata."""

from __future__ import annotations

import hashlib
import re
import uuid
from functools import lru_cache

from app.core.config.settings import get_settings
from app.storage.base import StorageProvider, StoredFile
from app.storage.local import LocalStorageProvider

_SAFE_FILENAME = re.compile(r"[^A-Za-z0-9._-]+")


class StorageService:
    def __init__(self, provider: StorageProvider) -> None:
        self.provider = provider

    @staticmethod
    def _safe_filename(filename: str) -> str:
        cleaned = _SAFE_FILENAME.sub("_", filename.strip()) or "file"
        return cleaned[:128]

    @staticmethod
    def checksum(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def build_key(self, checksum: str, filename: str) -> str:
        safe = self._safe_filename(filename)
        return f"{checksum[:2]}/{checksum[2:4]}/{uuid.uuid4().hex}_{safe}"

    async def save(
        self, filename: str, content_type: str | None, data: bytes
    ) -> StoredFile:
        checksum = self.checksum(data)
        key = self.build_key(checksum, filename)
        await self.provider.save(key, data)
        return StoredFile(
            storage_key=key,
            checksum=checksum,
            size_bytes=len(data),
            content_type=content_type,
            filename=filename,
            public_url=self.provider.url_for(key),
        )

    async def read(self, key: str) -> bytes:
        return await self.provider.read(key)

    async def delete(self, key: str) -> None:
        await self.provider.delete(key)


@lru_cache
def get_storage_service() -> StorageService:
    settings = get_settings()
    provider = LocalStorageProvider(
        base_dir=settings.storage_dir, public_url=settings.storage_public_url
    )
    return StorageService(provider)
