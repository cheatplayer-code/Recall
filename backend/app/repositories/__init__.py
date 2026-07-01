"""Repository layer: the only place SQLAlchemy queries live."""

from __future__ import annotations

from app.repositories.base import BaseRepository, Page
from app.repositories.chat import ConversationRepository, MessageRepository
from app.repositories.jobs import (
    DocumentProcessingJobRepository,
    UploadJobRepository,
)
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.retrieval import (
    EmbeddingRepository,
    KnowledgeChunkRepository,
    SearchRepository,
)
from app.repositories.user import (
    CollectionRepository,
    UserRepository,
    WorkspaceRepository,
)

__all__ = [
    "BaseRepository",
    "Page",
    "UserRepository",
    "WorkspaceRepository",
    "CollectionRepository",
    "KnowledgeRepository",
    "UploadJobRepository",
    "DocumentProcessingJobRepository",
    "KnowledgeChunkRepository",
    "EmbeddingRepository",
    "SearchRepository",
    "ConversationRepository",
    "MessageRepository",
]
