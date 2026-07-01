/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { KNOWLEDGE_TYPE_META } from "@/features/knowledge/constants";
import { byNewest } from "@/lib/knowledge-select";
import type { ID, KnowledgeItem } from "@/types";

import { useSetMemoryCollection } from "../hooks/use-collections";

/**
 * Add memories to — or remove them from — a collection in one place. Lists every
 * memory with a membership toggle; toggling on adds it to this collection,
 * toggling off clears its membership. This single surface satisfies both the
 * "add memory" and "remove memory" flows.
 */
export function ManageMemoriesDialog({
  open,
  onOpenChange,
  collectionId,
  allItems,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: ID;
  allItems: KnowledgeItem[];
}) {
  const [query, setQuery] = useState("");
  const setCollection = useSetMemoryCollection();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = byNewest(allItems);
    if (!q) return base;
    return base.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.excerpt?.toLowerCase().includes(q) ?? false) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [allItems, query]);

  const toggle = (item: KnowledgeItem) => {
    const isMember = item.collectionId === collectionId;
    setCollection.mutate({
      memoryId: item.id,
      collectionId: isMember ? null : collectionId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage memories</DialogTitle>
          <DialogDescription>
            Add memories to this collection or remove them. A memory belongs to one
            collection at a time.
          </DialogDescription>
        </DialogHeader>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search your memories…"
          aria-label="Search memories to add"
        />

        <ul className="-mx-2 max-h-80 space-y-0.5 overflow-y-auto px-2">
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              No memories match “{query.trim()}”.
            </li>
          )}
          {filtered.map((item) => {
            const meta = KNOWLEDGE_TYPE_META[item.type];
            const Icon = meta.icon;
            const isMember = item.collectionId === collectionId;
            const inOther = !isMember && Boolean(item.collectionId);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground ring-1 ring-white/5">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {meta.label}
                      {inOther && " · in another collection"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full ring-1 transition-colors",
                      isMember
                        ? "bg-primary/15 text-primary ring-primary/30"
                        : "bg-muted/50 text-muted-foreground ring-white/10",
                    )}
                    aria-hidden="true"
                  >
                    {isMember ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
