import { http } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import type { SearchRequest, SearchResponse } from "@/lib/api/contracts";

/**
 * Search + retrieval data access.
 *
 * `query` is the universal search box (`GET /search`) — its response already
 * matches the frontend `SearchResponse`. The retrieval methods (`retrieve`,
 * `similar`, `related`, `history`) map to the backend's vector retrieval API and
 * are live and ready for the search screen when it's built.
 */

export interface RetrievalCitation {
  chunkId: string;
  knowledgeItemId: string;
  documentTitle?: string;
  snippet: string;
  score: number;
  chunkIndex: number;
  pageNumber?: number;
  sectionTitle?: string;
}

export interface RetrievalResponse {
  query: string;
  citations: RetrievalCitation[];
  scores: number[];
  metrics: {
    retrievalLatencyMs: number;
    vectorLatencyMs: number;
    rerankLatencyMs: number;
    returnedCount: number;
    candidateCount: number;
  };
  nextCursor?: string | null;
}

export interface RetrievalFilters {
  workspaceId?: string;
  collectionId?: string;
  documentId?: string;
  tags?: string[];
  mimeType?: string;
  language?: string;
  status?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: Record<string, unknown>;
  latency: number;
  resultCount: number;
  createdAt: string;
}

export const searchService = {
  /** Universal lexical search over the knowledge store. */
  query: async ({ query, workspaceId, limit }: SearchRequest): Promise<SearchResponse> => {
    const q = new URLSearchParams({ query });
    if (workspaceId) q.set("workspaceId", workspaceId);
    if (limit !== undefined) q.set("limit", String(limit));
    return http.get<SearchResponse>(`${endpoints.search.query}?${q.toString()}`);
  },

  /** Vector retrieval with filters + pagination (POST /search). */
  retrieve: (body: {
    query: string;
    filters?: RetrievalFilters;
    limit?: number;
    offset?: number;
    cursor?: string;
  }): Promise<RetrievalResponse> => http.post<RetrievalResponse>(endpoints.search.retrieve, body),

  /** Chunks similar to a chunk or document. */
  similar: (body: {
    chunkId?: string;
    documentId?: string;
    limit?: number;
  }): Promise<RetrievalResponse> => http.post<RetrievalResponse>(endpoints.search.similar, body),

  /** Documents related to a document. */
  related: (body: { documentId: string; limit?: number }): Promise<RetrievalResponse> =>
    http.post<RetrievalResponse>(endpoints.search.related, body),

  /** Recent searches for the current user (analytics). */
  history: (limit = 50): Promise<SearchHistoryItem[]> =>
    http.get<SearchHistoryItem[]>(`${endpoints.search.history}?limit=${limit}`),
};
