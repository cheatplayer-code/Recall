import type { ID } from "@/types";

// SearchResponse already lives in the domain types and is the wire shape too —
// re-export it here so contracts are one import, without duplicating the type.
export type { SearchResponse, SearchResult } from "@/types";

/** GET /search request (query string + optional scope). */
export interface SearchRequest {
  query: string;
  workspaceId?: ID;
  limit?: number;
}
