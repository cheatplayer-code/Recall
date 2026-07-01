import type { EmbeddingStatus, KnowledgeItem, KnowledgeRag } from "@/types";

/**
 * RAG facets of a memory, derived when the backend hasn't supplied them yet.
 * This implements no embedding logic — it only reflects the pipeline state into
 * the shape AI Chat consumes, so the frontend is ready the moment the backend
 * starts sending real `rag` data (at which point `item.rag` wins).
 */
export function deriveRag(item: KnowledgeItem): KnowledgeRag {
  if (item.rag) return item.rag;

  const stage = item.pipeline.stage;
  const embeddingStatus: EmbeddingStatus =
    stage === "ready"
      ? "ready"
      : stage === "failed"
        ? "failed"
        : stage === "embedding" || stage === "indexing"
          ? "embedding"
          : "pending";

  const words = (item.content ?? item.excerpt ?? "")
    .split(/\s+/)
    .filter(Boolean).length;

  const chunkCount = stage === "ready" ? Math.max(1, Math.ceil(words / 120)) : 0;
  const paginated = item.type === "pdf" || item.type === "document";
  const pageCount = paginated ? Math.max(1, Math.ceil(words / 250)) : undefined;

  return {
    documentId: item.id,
    embeddingStatus,
    chunkCount,
    pageCount,
    processingStage: stage,
  };
}

export const EMBEDDING_STATUS_LABEL: Record<EmbeddingStatus, string> = {
  pending: "Not embedded",
  embedding: "Embedding…",
  ready: "Searchable",
  failed: "Embedding failed",
};

/** Whether a memory is fully ingested and therefore retrievable by AI Chat. */
export function isSearchable(item: KnowledgeItem): boolean {
  return item.pipeline.stage === "ready";
}
