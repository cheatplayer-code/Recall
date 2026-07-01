"""String-valued enums shared between models and schemas.

Stored as plain strings in the database (portable, migration-friendly). The
single definition here is the source of truth for both ORM and Pydantic layers
so values can never drift.
"""

from __future__ import annotations

import enum


class KnowledgeType(str, enum.Enum):
    PHOTO = "photo"
    PDF = "pdf"
    DOCUMENT = "document"
    VIDEO = "video"
    VOICE = "voice"
    NOTE = "note"
    IDEA = "idea"
    LINK = "link"
    WEBSITE = "website"
    BOOKMARK = "bookmark"


class KnowledgeStatus(str, enum.Enum):
    """Lifecycle of a KnowledgeItem (mirrors the driving job)."""

    UPLOADING = "uploading"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    INDEXING = "indexing"
    READY = "ready"
    FAILED = "failed"
    DELETED = "deleted"


class ProcessingStatus(str, enum.Enum):
    """Authoritative status of a DocumentProcessingJob."""

    QUEUED = "queued"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    INDEXING = "indexing"
    READY = "ready"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ProcessingStage(str, enum.Enum):
    """UI-facing stage label."""

    UPLOADING = "uploading"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    INDEXING = "indexing"
    READY = "ready"


class UploadStatus(str, enum.Enum):
    QUEUED = "queued"
    STORED = "stored"
    FAILED = "failed"


class EmbeddingStatus(str, enum.Enum):
    PENDING = "pending"
    EMBEDDING = "embedding"
    READY = "ready"
    FAILED = "failed"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageStatus(str, enum.Enum):
    PENDING = "pending"
    STREAMING = "streaming"
    COMPLETE = "complete"
    ERROR = "error"


# Terminal job statuses (no further processing).
TERMINAL_PROCESSING_STATUSES: frozenset[ProcessingStatus] = frozenset(
    {ProcessingStatus.READY, ProcessingStatus.FAILED, ProcessingStatus.CANCELLED}
)
