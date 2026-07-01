"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface CollectionFormValues {
  name: string;
  description?: string;
}

/**
 * The form body. Initialised once from `initial` via `useState` — the parent
 * remounts it (keyed by open + target) so it always starts fresh, with no
 * effect-based syncing.
 */
function CollectionFields({
  initial,
  isCreate,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: CollectionFormValues;
  isCreate: boolean;
  pending?: boolean;
  onSubmit: (values: CollectionFormValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onSubmit({ name: trimmed, description: description.trim() || undefined });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="collection-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reading list"
          autoFocus
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="collection-description" className="text-sm font-medium">
          Description <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What belongs in here?"
          className="min-h-20"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !name.trim()}>
          {isCreate ? "Create collection" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Create or rename a collection. Presentational + local form state only — the
 * caller owns the mutation and passes `onSubmit`. Used by both the "New
 * collection" action and the per-collection "Rename" action, so the two flows
 * share one form.
 */
export function CollectionFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: CollectionFormValues;
  pending?: boolean;
  onSubmit: (values: CollectionFormValues) => void;
}) {
  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? "New collection" : "Rename collection"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Group related memories into a curated set."
              : "Update this collection's name or description."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CollectionFields
            key={`${mode}:${initial?.name ?? ""}`}
            initial={initial}
            isCreate={isCreate}
            pending={pending}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
