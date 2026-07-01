"use client";

import { useMemo, useState } from "react";
import { FolderPlus, Plus } from "lucide-react";

import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useActiveWorkspaceId } from "@/hooks/use-active-workspace";

import { useCollections, useCreateCollection } from "./hooks/use-collections";
import { deriveCollections } from "./lib/derive";
import { CollectionCard } from "./components/collection-card";
import { CollectionFormDialog } from "./components/collection-form-dialog";

/**
 * Collections — curated sets of memories. Lists every collection as a card with
 * a live cover, count and last-updated time, and supports create / rename /
 * delete. Membership (add/remove memory) is managed on the collection detail.
 */
export function CollectionsScreen() {
  const workspaceId = useActiveWorkspaceId();
  const {
    data: collections,
    isLoading,
    isError,
    refetch,
  } = useCollections(workspaceId);
  const { data: items = [] } = useKnowledgeList({ workspaceId });
  const create = useCreateCollection();

  const [creating, setCreating] = useState(false);

  const views = useMemo(
    () => deriveCollections(collections ?? [], items),
    [collections, items],
  );

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" />
      New collection
    </Button>
  );

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Collections"
        description="Curated groups of memories — hand-picked and organised your way."
        actions={collections && collections.length > 0 ? newButton : undefined}
      />

      {isLoading && <LoadingState label="Gathering your collections…" />}

      {isError && (
        <ErrorState
          title="Collections are out of reach"
          description="Something interrupted the connection. Please try again."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && views.length === 0 && (
        <EmptyState
          icon={FolderPlus}
          title="No collections yet"
          description="Group related memories — a reading list, a project, a trip — into a collection you can return to."
          action={newButton}
        />
      )}

      {!isLoading && !isError && views.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {views.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

      <CollectionFormDialog
        open={creating}
        onOpenChange={setCreating}
        mode="create"
        pending={create.isPending}
        onSubmit={(values) =>
          create.mutate(
            { ...values, workspaceId },
            { onSuccess: () => setCreating(false) },
          )
        }
      />
    </PageContainer>
  );
}
