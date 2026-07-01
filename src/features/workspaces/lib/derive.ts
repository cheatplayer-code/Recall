import { byNewest, inWorkspace, latestTimestamp } from "@/lib/knowledge-select";
import type { Collection, KnowledgeItem, Workspace } from "@/types";

/** A workspace enriched with live, client-derived browsing facets. */
export interface WorkspaceView extends Workspace {
  memoryCount: number;
  collectionCount: number;
  collections: Collection[];
  recentUploads: KnowledgeItem[];
  recentActivityAt: string;
}

/**
 * Combine a workspace with loaded items and collections to compute its real
 * counts, member collections, recent uploads and last-activity time. Counts are
 * derived here because the workspace DTO carries none — keeping the wire model
 * lean and ready for a future server-side aggregate without any UI change.
 */
export function deriveWorkspace(
  workspace: Workspace,
  allItems: KnowledgeItem[],
  allCollections: Collection[],
): WorkspaceView {
  const members = inWorkspace(allItems, workspace.id);
  const collections = allCollections.filter(
    (c) => c.workspaceId === workspace.id,
  );
  return {
    ...workspace,
    memoryCount: members.length,
    collectionCount: collections.length,
    collections,
    recentUploads: byNewest(members).slice(0, 4),
    recentActivityAt: latestTimestamp(members, workspace.updatedAt),
  };
}

export function deriveWorkspaces(
  workspaces: Workspace[],
  allItems: KnowledgeItem[],
  allCollections: Collection[],
): WorkspaceView[] {
  return workspaces.map((w) => deriveWorkspace(w, allItems, allCollections));
}
