"""ORM models. Importing this package registers every table on ``Base.metadata``."""

from __future__ import annotations

from app.database.base import Base
from app.models.chat import Conversation, Message
from app.models.chunk import Embedding, KnowledgeChunk
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.models.knowledge import KnowledgeItem
from app.models.search import SearchSession
from app.models.user import User
from app.models.workspace import Collection, Workspace

__all__ = [
    "Base",
    "User",
    "Workspace",
    "Collection",
    "KnowledgeItem",
    "UploadJob",
    "DocumentProcessingJob",
    "KnowledgeChunk",
    "Embedding",
    "Conversation",
    "Message",
    "SearchSession",
]
