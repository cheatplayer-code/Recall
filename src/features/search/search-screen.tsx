"use client";

import { Clock, SearchX, Sparkles, X } from "lucide-react";

import {
  PageContainer,
  PageHeader,
  SearchBar,
  SectionHeading,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common";
import { MemoryCardGrid } from "@/features/knowledge";
import { RecentChats } from "@/features/home";

import { useSearch } from "./hooks/use-search";

/**
 * Search — one box across everything you've remembered. Filtering is instant and
 * client-side over the loaded store (lexical for now); results are grouped by
 * kind. Recent searches, empty and loading states keep the experience complete.
 */
export function SearchScreen() {
  const {
    query,
    setQuery,
    commit,
    recent,
    clearRecent,
    isLoading,
    isError,
    hasQuery,
    groups,
    conversations,
    totalCount,
  } = useSearch();

  // Memory groups exclude the chat-typed bucket; conversations render Chats.
  const memoryGroups = groups.filter((g) => g.key !== "chats");

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Search"
        description="Find anything across your memories, documents and conversations."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          size="lg"
          autoFocus
          placeholder="Search memories, documents, links and chats…"
          aria-label="Search your memory"
        />
      </form>

      {/* Idle state — recent searches + a gentle hint */}
      {!hasQuery && (
        <div className="space-y-8">
          {recent.length > 0 && (
            <section>
              <SectionHeading
                title="Recent searches"
                action={
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                    Clear
                  </button>
                }
              />
              <div className="flex flex-wrap gap-2">
                {recent.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-white/5 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Clock className="size-3.5" aria-hidden="true" />
                    {q}
                  </button>
                ))}
              </div>
            </section>
          )}

          <EmptyState
            icon={Sparkles}
            title="What are you looking for?"
            description="Search by title, content, tag or topic. Results group by documents, images, PDFs, notes, links and chats as you type."
          />
        </div>
      )}

      {/* Active query */}
      {hasQuery && isLoading && <LoadingState label="Searching your memory…" />}

      {hasQuery && isError && (
        <ErrorState
          title="Search is unavailable"
          description="We couldn't reach your memory just now. Please try again."
        />
      )}

      {hasQuery && !isLoading && !isError && totalCount === 0 && (
        <EmptyState
          icon={SearchX}
          title={`Nothing surfaces for “${query.trim()}”`}
          description="Try a different word, a tag, or a broader phrase."
        />
      )}

      {hasQuery && !isLoading && !isError && totalCount > 0 && (
        <div className="space-y-12">
          {memoryGroups.map((group) => (
            <section key={group.key}>
              <SectionHeading
                title={group.label}
                sublabel={`${group.items.length}`}
              />
              <MemoryCardGrid items={group.items} />
            </section>
          ))}

          {conversations.length > 0 && (
            <section>
              <SectionHeading
                title="Chats"
                sublabel={`${conversations.length}`}
              />
              <RecentChats conversations={conversations} />
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
