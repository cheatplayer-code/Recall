"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ArrowUpRight,
  Pencil,
  Share2,
  Star,
  Trash2,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { KnowledgeItem } from "@/types";

import {
  useDeleteKnowledge,
  useRenameKnowledge,
  useToggleFavorite,
} from "../hooks/use-knowledge";

/** Stop a click from bubbling to a parent <Link> (cards wrap the menu). */
function swallow(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * The per-memory context menu: open, rename, share, favorite, delete. Reused on
 * cards (hover overlay) and in the detail header. Holds no business logic — each
 * action is a mutation hook; this only orchestrates the popover and dialogs.
 */
export function MemoryMenu({
  item,
  className,
  onDeleted,
}: {
  item: KnowledgeItem;
  className?: string;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [shared, setShared] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = useToggleFavorite();
  const rename = useRenameKnowledge();
  const remove = useDeleteKnowledge();

  // Close the popover on outside click / Escape.
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

  const share = useCallback(
    async (e: React.MouseEvent) => {
      swallow(e);
      try {
        const url = `${window.location.origin}/knowledge/${item.id}`;
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      } catch {
        /* clipboard unavailable — no-op */
      }
    },
    [item.id],
  );

  return (
    <div
      ref={rootRef}
      data-open={open}
      className={cn("relative", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Memory actions"
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
          className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-xl bg-popover p-1 shadow-glow ring-1 ring-white/10"
        >
          <MenuLink href={`/knowledge/${item.id}`} icon={<ArrowUpRight className="size-4" />}>
            Open
          </MenuLink>
          <MenuButton
            icon={<Pencil className="size-4" />}
            onClick={(e) => {
              swallow(e);
              setOpen(false);
              setRenaming(true);
            }}
          >
            Rename
          </MenuButton>
          <MenuButton
            icon={
              shared ? (
                <Check className="size-4 text-success" />
              ) : (
                <Share2 className="size-4" />
              )
            }
            onClick={share}
          >
            {shared ? "Link copied" : "Share"}
          </MenuButton>
          <MenuButton
            icon={
              <Star
                className={cn(
                  "size-4",
                  item.isFavorite && "fill-current text-mood-positive",
                )}
              />
            }
            onClick={(e) => {
              swallow(e);
              toggleFavorite.mutate(item);
            }}
          >
            {item.isFavorite ? "Remove favorite" : "Add favorite"}
          </MenuButton>

          <div className="my-1 h-px bg-white/[0.08]" />

          <MenuButton
            icon={<Trash2 className="size-4" />}
            destructive
            onClick={(e) => {
              swallow(e);
              setOpen(false);
              setConfirmingDelete(true);
            }}
          >
            Delete
          </MenuButton>
        </div>
      )}

      {/* Rename */}
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename memory</DialogTitle>
            <DialogDescription>Give this memory a clearer name.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget)
                .get("title")
                ?.toString()
                .trim();
              if (value && value !== item.title) {
                rename.mutate({ id: item.id, title: value });
              }
              setRenaming(false);
            }}
          >
            <Input
              name="title"
              defaultValue={item.title}
              autoFocus
              aria-label="Memory title"
            />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenaming(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
            <DialogDescription>
              “{item.title}” will be removed from your memory. This can’t be undone.
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
              onClick={() => {
                remove.mutate(item.id);
                setConfirmingDelete(false);
                onDeleted?.();
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

function MenuButton({
  icon,
  children,
  destructive,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  destructive?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground/85 hover:bg-muted",
      )}
    >
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      {children}
    </button>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-foreground/85 transition-colors hover:bg-muted"
    >
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}
