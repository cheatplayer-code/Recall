import type { ID } from "./common";
import type { KnowledgeType } from "./knowledge";

export type SearchResultKind = "knowledge" | "collection" | "workspace" | "person";

/** A single hit returned by the universal search. */
export interface SearchResult {
  id: ID;
  kind: SearchResultKind;
  title: string;
  excerpt?: string;
  thumbnailUrl?: string;
  /** Present when kind === "knowledge". */
  knowledgeType?: KnowledgeType;
  /** Relevance score 0–1 (backend ranking). */
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
