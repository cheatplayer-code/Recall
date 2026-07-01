"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { workspaceService } from "@/services";
import type { ID, Workspace } from "@/types";

/** The user's workspaces — server state via React Query. */
export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: () => workspaceService.list(),
  });
}

/** A single workspace by id (detail page). */
export function useWorkspace(id: ID) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: () => workspaceService.getById(id),
    enabled: Boolean(id),
  });
}

/** Creates a workspace and prepends it to the cached list. */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      workspaceService.create(input),
    onSuccess: (workspace) => {
      queryClient.setQueryData<Workspace[]>(
        queryKeys.workspaces.list(),
        (old) => (old ? [...old, workspace] : [workspace]),
      );
    },
  });
}

/** Renames / edits a workspace, patching the cached list. */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: ID;
      name?: string;
      description?: string;
    }) => workspaceService.update(id, input),
    onSuccess: (workspace) => {
      queryClient.setQueryData<Workspace[]>(queryKeys.workspaces.list(), (old) =>
        old?.map((w) => (w.id === workspace.id ? workspace : w)),
      );
    },
  });
}

/** Deletes a workspace, removing it from the cached list. */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => workspaceService.remove(id),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<Workspace[]>(queryKeys.workspaces.list(), (old) =>
        old?.filter((w) => w.id !== id),
      );
    },
  });
}
