"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen, Plus, Settings2 } from "lucide-react";

import {
  PageContainer,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/format";
import { MemoryCardGrid } from "@/features/knowledge";
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import type { ID } from "@/types";

import { useCollection } from "./hooks/use-collections";
import { deriveCollection } from "./lib/derive";
import { CollectionMenu } from "./components/collection-menu";
import { ManageMemoriesDialog } from "./components/manage-memories-dialog";

/** A single collection: its memories, with add/remove management and rename/delete. */
export function CollectionDetail({ collectionId }: { collectionId: ID }) {
  const router = useRouter();
  const {
    data: collection,
    isLoading,
    isError,
    refetch,
  } = useCollection(collectionId);
  const { data: items = [] } = useKnowledgeList();
  const [managing, setManaging] = useState(false);

  const view = useMemo(
    () => (collection ? deriveCollection(collection, items) : null),
    [collection, items],
  );

  const backLink = (
    <Link
      href="/collections"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Collections
    </Link>
  );

  if (isLoading) {
    return (
      <PageContainer className="space-y-6">
        {backLink}
        <LoadingState label="Opening collection…" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer className="space-y-6">
        {backLink}
        <ErrorState
          title="Couldn't open this collection"
          description="Something interrupted the connection. Please try again."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  if (!collection || !view) {
    return (
      <PageContainer className="space-y-6">
        {backLink}
        <EmptyState
          icon={FolderOpen}
          title="Collection not found"
          description="This collection doesn't exist or has been deleted."
          action={
            <Button variant="outline" onClick={() => router.push("/collections")}>
              Back to collections
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      {backLink}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="font-editorial break-words text-[1.85rem] font-normal leading-tight tracking-tight">
            {view.name}
          </h1>
          {view.description && (
            <p className="break-words text-sm text-muted-foreground">
              {view.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70">
            {view.itemCount} {view.itemCount === 1 ? "memory" : "memories"} ·
            updated {formatRelativeDate(view.lastUpdatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setManaging(true)}>
            <Settings2 className="size-4" />
            Manage memories
          </Button>
          <CollectionMenu
            collection={collection}
            onDeleted={() => router.push("/collections")}
          />
        </div>
      </div>

      {view.members.length > 0 ? (
        <MemoryCardGrid items={view.members} />
      ) : (
        <EmptyState
          icon={Plus}
          title="This collection is empty"
          description="Add memories to start building this collection."
          action={
            <Button onClick={() => setManaging(true)}>
              <Plus className="size-4" />
              Add memories
            </Button>
          }
        />
      )}

      <ManageMemoriesDialog
        open={managing}
        onOpenChange={setManaging}
        collectionId={collection.id}
        allItems={items}
      />
    </PageContainer>
  );
}
