"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { inWorkspace } from "@/lib/knowledge-select";
import type { Collection, KnowledgeItem, Workspace } from "@/types";

/**
 * A compact overview of the user's workspaces, each with live memory and
 * collection counts derived from the loaded data. Links through to the full
 * Workspaces screen for browsing.
 */
export function WorkspaceOverview({
  workspaces,
  items,
  collections,
}: {
  workspaces: Workspace[];
  items: KnowledgeItem[];
  collections: Collection[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => {
        const memoryCount = inWorkspace(items, ws.id).length;
        const collectionCount = collections.filter(
          (c) => c.workspaceId === ws.id,
        ).length;
        return (
          <Link
            key={ws.id}
            href="/workspaces"
            className="group flex items-center gap-3 rounded-xl bg-card/50 p-4 ring-1 ring-white/[0.06] transition-colors hover:bg-card"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground ring-1 ring-white/10">
              {ws.icon ? (
                <span className="text-base">{ws.icon}</span>
              ) : (
                <LayoutGrid className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{ws.name}</span>
              <span className="block text-xs text-muted-foreground">
                {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
                {collectionCount > 0 &&
                  ` · ${collectionCount} ${
                    collectionCount === 1 ? "collection" : "collections"
                  }`}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
