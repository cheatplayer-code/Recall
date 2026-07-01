"use client";

import { useMemo, useState } from "react";
import { Brain, SearchX } from "lucide-react";

import {
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { UploadCenterDialog } from "@/features/upload";
import type { KnowledgeItem } from "@/types";

import { useActiveWorkspaceId } from "@/hooks/use-active-workspace";

import { useKnowledgeList } from "./hooks/use-knowledge";
import { selectHero } from "./presentation";
import { KnowledgeToolbar, type TypeFilter } from "./components/knowledge-toolbar";
import {
  MemoryFeed,
  MemoryFeedSkeleton,
  type MemoryGroup,
} from "./components/knowledge-grid";

function matchesSearch(item: KnowledgeItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  // A memory only becomes searchable once its pipeline reaches "ready".
  if (item.pipeline.stage !== "ready") return false;
  return (
    item.title.toLowerCase().includes(q) ||
    (item.excerpt?.toLowerCase().includes(q) ?? false) ||
    item.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const DAY_MS = 86_400_000;
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/**
 * Buckets memories into editorial time groups — how people recall, not how a
 * database sorts. Purely derived from existing item dates; no data is mutated.
 */
function groupByTime(items: KnowledgeItem[]): MemoryGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const thisMonth = now.getFullYear() * 12 + now.getMonth();

  const buckets = new Map<
    string,
    { label: string; order: number; sortAt: number; items: KnowledgeItem[] }
  >();

  for (const item of items) {
    const when = new Date(item.occurredAt ?? item.createdAt);
    const diffDays = Math.round(
      (todayStart.getTime() - startOfDay(when).getTime()) / DAY_MS,
    );
    const itemMonth = when.getFullYear() * 12 + when.getMonth();
    const monthsAgo = thisMonth - itemMonth;

    let key: string;
    let label: string;
    let order: number;

    if (diffDays <= 0) {
      [key, label, order] = ["today", "Today", 0];
    } else if (diffDays === 1) {
      [key, label, order] = ["yesterday", "Yesterday", 1];
    } else if (diffDays <= 6) {
      [key, label, order] = ["week", "Earlier this week", 2];
    } else if (monthsAgo === 0) {
      [key, label, order] = ["month", "This month", 3];
    } else if (monthsAgo === 1) {
      [key, label, order] = ["lastmonth", "Last month", 4];
    } else {
      key = `m-${itemMonth}`;
      label = MONTH_YEAR.format(when);
      order = 5;
    }

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.items.push(item);
      bucket.sortAt = Math.max(bucket.sortAt, when.getTime());
    } else {
      buckets.set(key, { label, order, sortAt: when.getTime(), items: [item] });
    }
  }

  const yesterday = new Date(todayStart.getTime() - DAY_MS);
  const sublabelFor = (key: string): string | undefined => {
    if (key === "today") return FULL_DATE.format(now);
    if (key === "yesterday") return FULL_DATE.format(yesterday);
    return undefined;
  };

  return [...buckets.entries()]
    .sort((a, b) => a[1].order - b[1].order || b[1].sortAt - a[1].sortAt)
    .map(([key, b]) => {
      const sorted = b.items.sort(
        (x, y) =>
          new Date(y.occurredAt ?? y.createdAt).getTime() -
          new Date(x.occurredAt ?? x.createdAt).getTime(),
      );
      const { hero, rest } = selectHero(sorted);
      return { key, label: b.label, sublabel: sublabelFor(key), hero, items: rest };
    });
}

/**
 * Knowledge — your Memory Feed. A calm, time-grouped stream of memories rather
 * than a database of records. Data comes from the service layer via React
 * Query; grouping and filtering are derived in memory for instant interaction.
 */
export function KnowledgeScreen() {
  const workspaceId = useActiveWorkspaceId();
  const { data, isLoading, isError, refetch } = useKnowledgeList({ workspaceId });

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const groups = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter(
      (item) =>
        (activeType === "all" || item.type === activeType) &&
        (!favoritesOnly || item.isFavorite) &&
        matchesSearch(item, search),
    );
    return groupByTime(filtered);
  }, [data, activeType, favoritesOnly, search]);

  const totalCount = data?.length ?? 0;
  const hasActiveFilters =
    activeType !== "all" || favoritesOnly || search.trim().length > 0;
  const hasResults = groups.length > 0;

  function resetFilters() {
    setSearch("");
    setActiveType("all");
    setFavoritesOnly(false);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Your memories"
        description={
          isLoading
            ? "Gathering your memories…"
            : `${totalCount} ${totalCount === 1 ? "memory" : "memories"} remembered`
        }
        actions={<UploadCenterDialog />}
      />

      <div className="mt-8 space-y-8">
        <KnowledgeToolbar
          search={search}
          onSearchChange={setSearch}
          activeType={activeType}
          onTypeChange={setActiveType}
          favoritesOnly={favoritesOnly}
          onFavoritesToggle={() => setFavoritesOnly((v) => !v)}
        />

        {isLoading && <MemoryFeedSkeleton />}

        {isError && (
          <ErrorState
            title="Your memories are out of reach"
            description="Something interrupted the connection to your memory."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && hasResults && <MemoryFeed groups={groups} />}

        {!isLoading && !isError && !hasResults && (
          <EmptyState
            icon={hasActiveFilters ? SearchX : Brain}
            title={
              hasActiveFilters
                ? "Nothing surfaces for that"
                : "Your memory is quiet — for now"
            }
            description={
              hasActiveFilters
                ? "Try another type, clear favorites, or soften your search."
                : "Capture a thought, voice, photo or idea — and watch it come alive."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
