"""StorageProvider interface + StoredFile metadata."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(slots=True)
class StoredFile:
    storage_key: str
    checksum: str
    size_bytes: int
    content_type: str | None
    filename: str
    public_url: str | None


class StorageProvider(ABC):
    @abstractmethod
    async def save(self, key: str, data: bytes) -> None: ...

    @abstractmethod
    async def read(self, key: str) -> bytes: ...

    @abstractmethod
    async def delete(self, key: str) -> None: ...

    @abstractmethod
    async def exists(self, key: str) -> bool: ...

    @abstractmethod
    async def list_keys(self, prefix: str = "") -> list[str]: ...

    @abstractmethod
    def url_for(self, key: str) -> str | None: ...
