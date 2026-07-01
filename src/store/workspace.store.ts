import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ID } from "@/types";

/**
 * Tracks which workspace the user is currently working in. The list of
 * workspaces themselves comes from React Query (server data); this store only
 * holds the active selection (client state) and persists it across reloads, so
 * the chosen workspace is remembered.
 */
interface WorkspaceState {
  activeWorkspaceId: ID | null;
  setActiveWorkspace: (id: ID | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
    }),
    { name: "recall.activeWorkspace" },
  ),
);
