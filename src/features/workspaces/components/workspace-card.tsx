/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Brain, FolderOpen, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import { KNOWLEDGE_TYPE_META } from "@/features/knowledge/constants";
import type { KnowledgeItem } from "@/types";

import type { WorkspaceView } from "../lib/derive";

/** A tiny recent-upload row: thumbnail-or-icon + title, linking to the memory. */
function RecentUpload({ item }: { item: KnowledgeItem }) {
  const meta = KNOWLEDGE_TYPE_META[item.type];
  const Icon = meta.icon;
  return (
    <Link
      href={`/knowledge/${item.id}`}
      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
    >
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground ring-1 ring-white/5">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon className="size-3.5" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
    </Link>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Brain;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

/**
 * A workspace as a rich browsing card: identity + live memory/collection counts,
 * recent activity time, its collections, and a peek at recent uploads. Reuses the
 * shared knowledge metadata so a workspace reads consistently with the rest of
 * the app.
 */
export function WorkspaceCard({ workspace }: { workspace: WorkspaceView }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card/50 p-5 ring-1 ring-white/[0.06]">
      <header className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground ring-1 ring-white/10"
          style={workspace.color ? { background: workspace.color } : undefined}
        >
          {workspace.icon ? (
            <span className="text-lg">{workspace.icon}</span>
          ) : (
            <LayoutGrid className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-editorial truncate text-lg leading-snug">
            {workspace.name}
          </h2>
          <p className="text-xs text-muted-foreground/70">
            Active {formatRelativeDate(workspace.recentActivityAt)}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <Stat icon={Brain} value={workspace.memoryCount} label="memories" />
        <Stat
          icon={FolderOpen}
          value={workspace.collectionCount}
          label="collections"
        />
      </div>

      {workspace.collections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {workspace.collections.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-white/5 transition-colors hover:bg-muted hover:text-foreground"
            >
              <FolderOpen className="size-3" aria-hidden="true" />
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className={cn("mt-auto", workspace.recentUploads.length === 0 && "hidden")}>
        <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/50">
          Recent uploads
        </p>
        <div className="space-y-0.5">
          {workspace.recentUploads.map((item) => (
            <RecentUpload key={item.id} item={item} />
          ))}
        </div>
      </div>

      {workspace.memoryCount === 0 && (
        <p className="text-sm text-muted-foreground">
          No memories here yet — captures default to this space.
        </p>
      )}
    </section>
  );
}
