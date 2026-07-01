"""Storage seam: provider interface, local provider, and service."""

from __future__ import annotations

from app.storage.base import StorageProvider, StoredFile
from app.storage.local import LocalStorageProvider
from app.storage.service import StorageService, get_storage_service

__all__ = [
    "StorageProvider",
    "StoredFile",
    "LocalStorageProvider",
    "StorageService",
    "get_storage_service",
]
