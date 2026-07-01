"use client";

import { useWorkspaceStore } from "@/store";
import type { ID } from "@/types";

/**
 * The id of the workspace the user is currently working in, scoped into list
 * queries (Knowledge, Collections, Search, Recent, Home). `undefined` means
 * "not yet chosen" — queries fall back to all workspaces until the switcher
 * resolves a default.
 */
export function useActiveWorkspaceId(): ID | undefined {
  return useWorkspaceStore((s) => s.activeWorkspaceId) ?? undefined;
}
