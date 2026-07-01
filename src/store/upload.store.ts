import { create } from "zustand";

import type { ID, KnowledgeItem, KnowledgePipeline } from "@/types";

/**
 * Session-scoped state for the Upload screen: the items uploaded in this visit
 * and their live pipeline. This is UI state — the canonical Knowledge data lives
 * in the React Query cache, which the upload hook patches in parallel.
 */
interface UploadState {
  uploads: KnowledgeItem[];
  add: (item: KnowledgeItem) => void;
  replaceId: (tempId: ID, item: KnowledgeItem) => void;
  patchPipeline: (id: ID, pipeline: KnowledgePipeline) => void;
  dismiss: (id: ID) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],
  add: (item) => set((s) => ({ uploads: [item, ...s.uploads] })),
  replaceId: (tempId, item) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.id === tempId ? item : u)),
    })),
  patchPipeline: (id, pipeline) =>
    set((s) => ({
      uploads: s.uploads.map((u) =>
        u.id === id ? { ...u, pipeline, updatedAt: pipeline.updatedAt } : u,
      ),
    })),
  dismiss: (id) => set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),
  reset: () => set({ uploads: [] }),
}));
