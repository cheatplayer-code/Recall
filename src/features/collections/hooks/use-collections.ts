"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { collectionService, knowledgeService, workspaceService } from "@/services";
import { patchKnowledgeItem } from "@/features/upload/lib/knowledge-cache";
import type { Collection, ID } from "@/types";

/** The user's collections (optionally scoped to a workspace). */
export function useCollections(workspaceId?: ID) {
  return useQuery({
    queryKey: queryKeys.collections.list(workspaceId),
    queryFn: () => collectionService.list(workspaceId),
  });
}

/** A single collection by id (detail page). */
export function useCollection(id: ID) {
  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: () => collectionService.getById(id),
    enabled: Boolean(id),
  });
}

/** Invalidate every cached collection list (workspace-scoped keys vary). */
function invalidateCollectionLists(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
}

/**
 * Creates a collection. A workspace is required server-side; when the caller
 * omits one we resolve the user's first workspace, mirroring upload behaviour.
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      workspaceId?: ID;
    }) => {
      let workspaceId = input.workspaceId;
      if (!workspaceId) {
        const spaces = await workspaceService.list();
        workspaceId = spaces[0]?.id;
      }
      if (!workspaceId) {
        throw new Error("No workspace available to hold the collection.");
      }
      return collectionService.create({
        name: input.name,
        description: input.description,
        workspaceId,
      });
    },
    onSuccess: () => invalidateCollectionLists(queryClient),
  });
}

/** Renames / edits a collection. */
export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: ID;
      name?: string;
      description?: string;
    }) => collectionService.update(id, input),
    onSuccess: (collection) => {
      queryClient.setQueryData<Collection | null>(
        queryKeys.collections.detail(collection.id),
        collection,
      );
      invalidateCollectionLists(queryClient);
    },
  });
}

/** Deletes a collection. Member memories keep existing (membership is cleared). */
export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => collectionService.remove(id),
    onSuccess: () => {
      invalidateCollectionLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
  });
}

/**
 * Adds (or removes, with `collectionId: null`) a memory's collection membership.
 * Patches the knowledge caches optimistically so the grids update instantly,
 * then refreshes lists so derived counts/covers stay correct.
 */
export function useSetMemoryCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      collectionId,
    }: {
      memoryId: ID;
      collectionId: ID | null;
    }) => knowledgeService.setCollection(memoryId, collectionId),
    onMutate: ({ memoryId, collectionId }) => {
      patchKnowledgeItem(queryClient, memoryId, {
        collectionId: collectionId ?? undefined,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
      invalidateCollectionLists(queryClient);
    },
  });
}
