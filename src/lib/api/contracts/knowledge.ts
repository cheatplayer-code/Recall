import type { ID, KnowledgeItem, KnowledgeType, Paginated } from "@/types";

/** GET /knowledge query parameters. */
export interface KnowledgeListRequest {
  workspaceId?: ID;
  collectionId?: ID;
  type?: KnowledgeType;
  favoritesOnly?: boolean;
  page?: number;
  pageSize?: number;
}

/** GET /knowledge response (paginated). */
export type KnowledgeListResponse = Paginated<KnowledgeItem>;

/** GET /knowledge/:id response. */
export interface KnowledgeDetailResponse {
  item: KnowledgeItem;
}
