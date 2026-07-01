/**
 * Request/response contracts for the FastAPI backend. Every service imports the
 * contract for the endpoint it represents, so swapping a mock body for an
 * `http.*` / streaming call requires no signature changes upstream.
 */
export type {
  ChatStreamRequestBody,
  ChatStreamEvent,
  ChatStreamGrounding,
  ChatStreamHandlers,
} from "./chat";
export type {
  DocumentUploadRequest,
  DocumentPreview,
  DocumentUploadResponse,
  DocumentStatusResponse,
} from "./documents";
export type {
  KnowledgeListRequest,
  KnowledgeListResponse,
  KnowledgeDetailResponse,
} from "./knowledge";
export type { SearchRequest, SearchResponse, SearchResult } from "./search";
