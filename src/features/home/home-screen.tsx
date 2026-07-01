"use client";

import { useMemo } from "react";

import {
  PageContainer,
  SectionHeading,
  LoadingState,
  ErrorState,
} from "@/components/common";
import { MemoryCardGrid } from "@/features/knowledge";
import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useCollections } from "@/features/collections/hooks/use-collections";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useActiveWorkspaceId } from "@/hooks/use-active-workspace";
import { byNewest, favorites, isProcessing, recentlyViewed } from "@/lib/knowledge-select";
import type { Conversation } from "@/types";

import { Greeting } from "./components/greeting";
import { QuickCapture } from "./components/quick-capture";
import { ContinueCard } from "./components/continue-card";
import { WorkspaceOverview } from "./components/workspace-overview";
import { RecentChats } from "./components/recent-chats";

function byUpdatedDesc(a: Conversation, b: Conversation): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

/**
 * Home — the dashboard. A calm, glanceable summary of the user's memory: what to
 * resume, what's still processing, what's recent, and where to go next. Every
 * section is derived from live data and hidden when empty, so the page is always
 * meaningful and never shows placeholder copy.
 */
export function HomeScreen() {
  const workspaceId = useActiveWorkspaceId();
  const { data: user } = useCurrentUser();
  // Feed sections scope to the active workspace; the overview spans all of them.
  const { data: items, isLoading, isError, refetch } = useKnowledgeList({ workspaceId });
  const { data: allItems = [] } = useKnowledgeList({});
  const { data: conversations = [] } = useConversations();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: collections = [] } = useCollections();

  const derived = useMemo(() => {
    const all = items ?? [];
    const recentUploads = byNewest(all).slice(0, 6);
    const viewed = recentlyViewed(all).slice(0, 6);
    const favs = favorites(all).slice(0, 6);
    const processing = byNewest(all.filter(isProcessing)).slice(0, 6);
    const recentChats = [...conversations].sort(byUpdatedDesc).slice(0, 5);
    return {
      total: all.length,
      recentUploads,
      viewed,
      favs,
      processing,
      recentChats,
      latestConversation: recentChats[0],
      continueMemory: viewed[0] ?? recentUploads[0],
    };
  }, [items, conversations]);

  return (
    <PageContainer className="space-y-12">
      <Greeting name={user?.name} total={derived.total} />

      {isError ? (
        <ErrorState
          title="We couldn't reach your memory"
          description="Something interrupted the connection. Please try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <LoadingState label="Gathering your day…" />
      ) : (
        <>
          {/* Continue where you left off */}
          <section>
            <SectionHeading title="Continue where you left off" />
            <ContinueCard
              conversation={derived.latestConversation}
              memory={
                derived.latestConversation ? undefined : derived.continueMemory
              }
            />
          </section>

          <QuickCapture />

          {/* Still processing */}
          {derived.processing.length > 0 && (
            <section>
              <SectionHeading
                title="Still settling in"
                sublabel={`${derived.processing.length} processing`}
              />
              <MemoryCardGrid items={derived.processing} />
            </section>
          )}

          {/* Recent uploads */}
          {derived.recentUploads.length > 0 && (
            <section>
              <SectionHeading
                title="Recently captured"
                href="/recent"
                sublabel={`${derived.total} total`}
              />
              <MemoryCardGrid items={derived.recentUploads} />
            </section>
          )}

          {/* Recently viewed */}
          {derived.viewed.length > 0 && (
            <section>
              <SectionHeading title="Recently viewed" href="/knowledge" />
              <MemoryCardGrid items={derived.viewed} />
            </section>
          )}

          {/* Favorites */}
          {derived.favs.length > 0 && (
            <section>
              <SectionHeading title="Favorite memories" />
              <MemoryCardGrid items={derived.favs} />
            </section>
          )}

          {/* Workspace overview */}
          {workspaces.length > 0 && (
            <section>
              <SectionHeading
                title="Your workspaces"
                href="/workspaces"
                sublabel={`${workspaces.length}`}
              />
              <WorkspaceOverview
                workspaces={workspaces}
                items={allItems}
                collections={collections}
              />
            </section>
          )}

          {/* Recent AI chats */}
          {derived.recentChats.length > 0 && (
            <section>
              <SectionHeading title="Recent conversations" href="/chat" />
              <RecentChats conversations={derived.recentChats} />
            </section>
          )}
        </>
      )}
    </PageContainer>
  );
}
