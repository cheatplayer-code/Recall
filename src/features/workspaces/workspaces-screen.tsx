"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";

import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common";
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
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useCollections } from "@/features/collections/hooks/use-collections";

import { useWorkspaces, useCreateWorkspace } from "./hooks/use-workspaces";
import { deriveWorkspaces } from "./lib/derive";
import { WorkspaceCard } from "./components/workspace-card";

/** Spaces we suggest, so a new account can grow beyond the default "Personal". */
const SUGGESTED = ["Research", "Startup", "University"] as const;

/**
 * Workspaces — separate spaces for different areas of life and work. Lists every
 * workspace with live activity, memory and collection counts, and recent
 * uploads. New workspaces can be created freely; suggested names make common
 * spaces one click away. The data shape is already multi-workspace.
 */
export function WorkspacesScreen() {
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces();
  const { data: items = [] } = useKnowledgeList();
  const { data: collections = [] } = useCollections();
  const create = useCreateWorkspace();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const views = useMemo(
    () => deriveWorkspaces(workspaces ?? [], items, collections),
    [workspaces, items, collections],
  );

  const existingNames = useMemo(
    () => new Set((workspaces ?? []).map((w) => w.name.toLowerCase())),
    [workspaces],
  );
  const suggestions = SUGGESTED.filter((s) => !existingNames.has(s.toLowerCase()));

  const submitCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(
      { name: trimmed, description: description.trim() || undefined },
      {
        onSuccess: () => {
          setCreating(false);
          setName("");
          setDescription("");
        },
      },
    );
  };

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" />
      New workspace
    </Button>
  );

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Workspaces"
        description="Separate spaces for different areas of your life and work."
        actions={workspaces && workspaces.length > 0 ? newButton : undefined}
      />

      {isLoading && <LoadingState label="Gathering your workspaces…" />}

      {isError && (
        <ErrorState
          title="Workspaces are out of reach"
          description="Something interrupted the connection. Please try again."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && views.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create a workspace to keep different areas of your memory apart."
          action={newButton}
        />
      )}

      {!isLoading && !isError && views.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {views.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-6">
              <span className="text-sm text-muted-foreground">Add a space for</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={create.isPending}
                  onClick={() => create.mutate({ name: s })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-white/5 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              A separate space with its own memories and collections.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Research"
                autoFocus
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="workspace-description" className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="workspace-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What lives in this space?"
                className="min-h-20"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending || !name.trim()}>
                Create workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
