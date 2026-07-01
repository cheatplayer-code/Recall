import { http, HttpError } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import {
  mapKnowledgeItem,
  type KnowledgeItemDTO,
  type PageDTO,
} from "@/lib/api/mappers";
import type { KnowledgeListRequest } from "@/lib/api/contracts";
import type { ID, KnowledgeItem, KnowledgeType } from "@/types";

import { workspaceService } from "./workspace.service";

/** Query params for the knowledge list — the GET /knowledge contract. */
export type KnowledgeListParams = KnowledgeListRequest;

/** Payload for creating a new item from the Upload Center. */
export interface CreateKnowledgeInput {
  type: KnowledgeType;
  title: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  sourceUrl?: string;
  /** Object URL now, backend preview URL later. */
  previewUrl?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  workspaceId?: ID;
  collectionId?: ID;
  /** The original file, when this input came from a real upload. */
  file?: File;
}

const DEFAULT_PAGE_SIZE = 100; // backend max; the screen filters/sorts in memory.

function listQuery(params: KnowledgeListParams): string {
  const q = new URLSearchParams();
  if (params.workspaceId) q.set("workspaceId", params.workspaceId);
  if (params.type) q.set("type", params.type);
  if (params.favoritesOnly) q.set("favoritesOnly", "true");
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? DEFAULT_PAGE_SIZE));
  return q.toString();
}

/** Resolve a workspace id, defaulting to the user's first workspace. */
async function resolveWorkspaceId(workspaceId?: ID): Promise<ID | undefined> {
  if (workspaceId) return workspaceId;
  const spaces = await workspaceService.list();
  return spaces[0]?.id;
}

export const knowledgeService = {
  list: async (params: KnowledgeListParams = {}): Promise<KnowledgeItem[]> => {
    const page = await http.get<PageDTO<KnowledgeItemDTO>>(
      `${endpoints.knowledge.list}?${listQuery(params)}`,
    );
    let items = page.items.map(mapKnowledgeItem);
    // collectionId isn't a server filter yet — narrow client-side when asked.
    if (params.collectionId) {
      items = items.filter((i) => i.collectionId === params.collectionId);
    }
    return items;
  },

  getById: async (id: ID): Promise<KnowledgeItem | null> => {
    try {
      const dto = await http.get<KnowledgeItemDTO>(endpoints.knowledge.detail(id));
      return mapKnowledgeItem(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },

  /** Most recently created items, newest first (backend default ordering). */
  recent: async (limit = 10): Promise<KnowledgeItem[]> => {
    const page = await http.get<PageDTO<KnowledgeItemDTO>>(
      `${endpoints.knowledge.list}?page=1&pageSize=${limit}`,
    );
    return page.items.map(mapKnowledgeItem);
  },

  create: async (input: CreateKnowledgeInput): Promise<KnowledgeItem> => {
    const workspaceId = await resolveWorkspaceId(input.workspaceId);
    const dto = await http.post<KnowledgeItemDTO>(endpoints.knowledge.create, {
      type: input.type,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      sourceUrl: input.sourceUrl,
      previewUrl: input.previewUrl,
      thumbnailUrl: input.thumbnailUrl,
      fileUrl: input.fileUrl,
      tags: input.tags ?? [],
      workspaceId,
      collectionId: input.collectionId,
    });
    return mapKnowledgeItem(dto);
  },

  /** Toggle the favorite flag, returning the updated item. */
  toggleFavorite: async (id: ID): Promise<KnowledgeItem | null> => {
    const current = await knowledgeService.getById(id);
    if (!current) return null;
    const dto = await http.patch<KnowledgeItemDTO>(endpoints.knowledge.detail(id), {
      isFavorite: !current.isFavorite,
    });
    return mapKnowledgeItem(dto);
  },

  /** Rename a memory. */
  rename: async (id: ID, title: string): Promise<KnowledgeItem | null> => {
    const dto = await http.patch<KnowledgeItemDTO>(endpoints.knowledge.detail(id), {
      title,
    });
    return mapKnowledgeItem(dto);
  },

  /**
   * Move a memory into a collection, or out of one (`null`). The backend applies
   * only the fields present in the PATCH body, so sending `collectionId: null`
   * explicitly clears membership — this is how "remove from collection" works.
   */
  setCollection: async (
    id: ID,
    collectionId: ID | null,
  ): Promise<KnowledgeItem> => {
    const dto = await http.patch<KnowledgeItemDTO>(endpoints.knowledge.detail(id), {
      collectionId,
    });
    return mapKnowledgeItem(dto);
  },

  /** Delete a memory, returning its id. */
  remove: async (id: ID): Promise<{ id: ID }> => {
    await http.delete<void>(endpoints.knowledge.detail(id));
    return { id };
  },

  /**
   * Record that the user opened a memory. The backend has no dedicated
   * "accessed" mutation, so this reflects the timestamp locally for the UI; the
   * canonical value arrives with the item from the backend.
   */
  markAccessed: async (id: ID): Promise<KnowledgeItem | null> => {
    const current = await knowledgeService.getById(id);
    if (!current) return null;
    return { ...current, lastAccessedAt: new Date().toISOString() };
  },

  /**
   * Memories related to `id`, via the backend retrieval API. Resolves related
   * document ids to full items so the detail page can render cards. Requires the
   * source document to be processed; returns [] otherwise.
   */
  related: async (id: ID, limit = 4): Promise<KnowledgeItem[]> => {
    try {
      const res = await http.post<{ citations: { knowledgeItemId: string }[] }>(
        endpoints.search.related,
        { documentId: id, limit },
      );
      const ids = Array.from(
        new Set(res.citations.map((c) => c.knowledgeItemId)),
      ).filter((docId) => docId !== id);
      const items = await Promise.all(
        ids.map((docId) => knowledgeService.getById(docId)),
      );
      return items.filter((i): i is KnowledgeItem => i !== null).slice(0, limit);
    } catch {
      return [];
    }
  },
};
