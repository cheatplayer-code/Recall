"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";

import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common";
import { UploadCenterDialog } from "@/features/upload";
import { MemoryCardGrid } from "@/features/knowledge";
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useActiveWorkspaceId } from "@/hooks/use-active-workspace";
import { byNewest } from "@/lib/knowledge-select";

/**
 * Recent — the latest things you've captured, newest first. A flat chronological
 * view of the same memories (no time bucketing), reusing the shared memory grid.
 */
export function RecentScreen() {
  const workspaceId = useActiveWorkspaceId();
  const { data: items, isLoading, isError, refetch } = useKnowledgeList({ workspaceId });

  const ordered = useMemo(() => byNewest(items ?? []), [items]);

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Recent"
        description="The latest things you've captured, newest first."
        actions={<UploadCenterDialog />}
      />

      {isLoading && <LoadingState label="Gathering your recent memories…" />}

      {isError && (
        <ErrorState
          title="Your recent memories are out of reach"
          description="Something interrupted the connection. Please try again."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && ordered.length === 0 && (
        <EmptyState
          icon={Clock}
          title="Nothing captured yet"
          description="Your most recent memories will appear here as you add them."
        />
      )}

      {!isLoading && !isError && ordered.length > 0 && (
        <MemoryCardGrid items={ordered} />
      )}
    </PageContainer>
  );
}
