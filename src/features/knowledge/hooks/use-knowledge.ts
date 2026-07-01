"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { knowledgeService, type KnowledgeListParams } from "@/services";
import { queryKeys } from "@/lib/api/query-keys";
// Shared optimistic cache helpers (currently colocated with the upload feature).
import {
  patchKnowledgeItem,
  removeKnowledgeItem,
} from "@/features/upload/lib/knowledge-cache";
import type { ID, KnowledgeItem } from "@/types";

/**
 * Fetches knowledge items through the service layer. The screen fetches the
 * full set once and filters/sorts in memory for instant interaction; pass
 * `params` (e.g. workspaceId) to scope server-side when needed.
 */
export function useKnowledgeList(params: KnowledgeListParams = {}) {
  return useQuery({
    queryKey: queryKeys.knowledge.list(params),
    queryFn: () => knowledgeService.list(params),
  });
}

/** Fetches a single knowledge item by id (used by the detail page). */
export function useKnowledgeItem(id: ID) {
  return useQuery({
    queryKey: queryKeys.knowledge.detail(id),
    queryFn: () => knowledgeService.getById(id),
    enabled: Boolean(id),
  });
}

/** Memories related to `id`, for the detail page. */
export function useRelatedKnowledge(id: ID) {
  return useQuery({
    queryKey: queryKeys.knowledge.related(id),
    queryFn: () => knowledgeService.related(id),
    enabled: Boolean(id),
  });
}

/**
 * Toggles favorite with an optimistic cache patch, rolling back on error.
 * Pass the current item so the previous flag is known.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: KnowledgeItem) =>
      knowledgeService.toggleFavorite(item.id),
    onMutate: (item) => {
      patchKnowledgeItem(queryClient, item.id, {
        isFavorite: !item.isFavorite,
      });
    },
    onError: (_error, item) => {
      patchKnowledgeItem(queryClient, item.id, { isFavorite: item.isFavorite });
    },
  });
}

/** Renames a memory optimistically. */
export function useRenameKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: ID; title: string }) =>
      knowledgeService.rename(id, title),
    onMutate: ({ id, title }) => {
      const previous = queryClient.getQueryData<KnowledgeItem | null>(
        queryKeys.knowledge.detail(id),
      );
      patchKnowledgeItem(queryClient, id, { title });
      return { previousTitle: previous?.title };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTitle !== undefined) {
        patchKnowledgeItem(queryClient, id, { title: context.previousTitle });
      }
    },
  });
}

/** Deletes a memory, removing it from every cache immediately. */
export function useDeleteKnowledge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => knowledgeService.remove(id),
    onMutate: (id) => {
      removeKnowledgeItem(queryClient, id);
    },
  });
}

/** Records that a memory was opened (drives "last accessed"). */
export function useMarkAccessed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => knowledgeService.markAccessed(id),
    onSuccess: (item) => {
      if (item) {
        patchKnowledgeItem(queryClient, item.id, {
          lastAccessedAt: item.lastAccessedAt,
        });
      }
    },
  });
}
