"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Collection } from "@/types";

import { useDeleteCollection, useUpdateCollection } from "../hooks/use-collections";
import { CollectionFormDialog } from "./collection-form-dialog";

function swallow(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Per-collection actions: rename and delete. Reused on collection cards (hover
 * overlay) and on the detail header. Owns its mutations; the optional
 * `onDeleted` lets a caller (e.g. the detail page) navigate away afterwards.
 */
export function CollectionMenu({
  collection,
  className,
  onDeleted,
}: {
  collection: Collection;
  className?: string;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const update = useUpdateCollection();
  const remove = useDeleteCollection();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-open={open} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Collection actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          swallow(e);
          setOpen((v) => !v);
        }}
        className="rounded-full bg-background/70 text-foreground/80 backdrop-blur hover:bg-background"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </Button>

      {open && (
        <div
          role="menu"
          onClick={swallow}
          className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl bg-popover p-1 shadow-glow ring-1 ring-white/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              swallow(e);
              setOpen(false);
              setRenaming(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-foreground/85 transition-colors hover:bg-muted"
          >
            <Pencil className="size-4 text-muted-foreground" />
            Rename
          </button>
          <div className="my-1 h-px bg-white/[0.08]" />
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              swallow(e);
              setOpen(false);
              setConfirmingDelete(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      )}

      <CollectionFormDialog
        open={renaming}
        onOpenChange={setRenaming}
        mode="edit"
        initial={{ name: collection.name, description: collection.description }}
        pending={update.isPending}
        onSubmit={(values) => {
          update.mutate(
            { id: collection.id, ...values },
            { onSuccess: () => setRenaming(false) },
          );
        }}
      />

      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete this collection?</DialogTitle>
            <DialogDescription>
              “{collection.name}” will be removed. The memories inside stay in your
              knowledge — only the grouping is deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                remove.mutate(collection.id, {
                  onSuccess: () => {
                    setConfirmingDelete(false);
                    onDeleted?.();
                  },
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
