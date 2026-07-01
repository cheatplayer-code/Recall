import type { HasTimestamps, ID, ISODateString } from "./common";
import type { KnowledgePipeline, PipelineStage } from "./pipeline";

/**
 * What kind of memory/knowledge a captured item represents. The first six are
 * the original set; the rest extend coverage to every supported source. An
 * image memory uses `photo`, the existing visual composition.
 */
export type KnowledgeType =
  | "note"
  | "voice"
  | "photo"
  | "document"
  | "link"
  | "idea"
  | "pdf"
  | "video"
  | "website"
  | "bookmark"
  | "chat";

/**
 * State of a memory's vector embeddings — what AI Chat needs before it can
 * retrieve from this item. Mirrors the backend embedding job; the client never
 * computes embeddings, it only reflects their status.
 */
export type EmbeddingStatus = "pending" | "embedding" | "ready" | "failed";

/**
 * RAG-facing facets of a memory: everything AI Chat needs to retrieve from and
 * cite this item. Optional on the model — the backend fills it during ingestion;
 * until then `deriveRag()` provides a best-effort view from the pipeline.
 */
export interface KnowledgeRag {
  /** Stable id the vector store and citations reference. */
  documentId: ID;
  embeddingStatus: EmbeddingStatus;
  /** Number of chunks the document was split into. */
  chunkCount: number;
  /** Page count, for paginated sources (pdf / document). */
  pageCount?: number;
  /** Current ingestion stage — mirrors `KnowledgePipeline.stage`. */
  processingStage: PipelineStage;
}

/** AI-detected sentiment of an item. */
export type Mood = "positive" | "neutral" | "negative" | "mixed";

/**
 * Coarse processing status used for list badges and filtering. Derived from the
 * detailed {@link KnowledgePipeline} via `getProcessingStatus()` — never stored
 * separately, so the two can't drift.
 */
export type ProcessingStatus = "uploading" | "processing" | "ready" | "failed";

export interface Person {
  id: ID;
  name: string;
  avatarUrl?: string;
}

export interface GeoLocation {
  name: string;
  lat?: number;
  lng?: number;
}

/**
 * AI-generated enrichment attached to a knowledge item. Populated by the
 * backend pipeline (transcription → summary → emotion → tags → ...). Optional
 * because enrichment may still be processing.
 */
export interface AIEnrichment {
  title?: string;
  summary?: string;
  mood?: Mood;
  topics?: string[];
  keyMoments?: string[];
  actionItems?: string[];
}

export interface KnowledgeItem extends HasTimestamps {
  id: ID;
  workspaceId: ID;
  collectionId?: ID;
  type: KnowledgeType;
  /** Full AI-pipeline state. The coarse status is derived from this. */
  pipeline: KnowledgePipeline;
  title: string;
  /** Raw text / transcript / body of the item. */
  content?: string;
  excerpt?: string;
  /** Small thumbnail for cards (image/video). */
  thumbnailUrl?: string;
  /** Renderable preview: the image itself, a PDF first-page render, a video poster. */
  previewUrl?: string;
  /** The original uploaded file, for download / open (object URL, then backend URL). */
  fileUrl?: string;
  /** Original source URL, for "Open source" (links/websites/bookmarks). */
  sourceUrl?: string;
  /** When the memory actually happened (may differ from createdAt). */
  occurredAt?: ISODateString;
  /** Last time the user opened this memory. */
  lastAccessedAt?: ISODateString;
  tags: string[];
  people: Person[];
  location?: GeoLocation;
  ai?: AIEnrichment;
  /**
   * RAG facets for AI Chat retrieval/citations. Optional — populated by the
   * backend; `deriveRag()` fills the gap until then.
   */
  rag?: KnowledgeRag;
  isFavorite: boolean;
}
