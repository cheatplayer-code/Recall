import { getProcessingStatus } from "@/lib/pipeline";
import type { ID, KnowledgeItem } from "@/types";

/** Epoch ms for an item's creation (safe for sorting). */
function createdMs(item: KnowledgeItem): number {
  return new Date(item.createdAt).getTime();
}

/** Epoch ms for an item's last update. */
function updatedMs(item: KnowledgeItem): number {
  return new Date(item.updatedAt).getTime();
}

/** A new array sorted newest-first by creation date. */
export function byNewest(items: KnowledgeItem[]): KnowledgeItem[] {
  return [...items].sort((a, b) => createdMs(b) - createdMs(a));
}

/** A new array sorted by most recently updated. */
export function byRecentlyUpdated(items: KnowledgeItem[]): KnowledgeItem[] {
  return [...items].sort((a, b) => updatedMs(b) - updatedMs(a));
}

/** Items the user has opened, most recent first. */
export function recentlyViewed(items: KnowledgeItem[]): KnowledgeItem[] {
  return items
    .filter((i) => Boolean(i.lastAccessedAt))
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt as string).getTime() -
        new Date(a.lastAccessedAt as string).getTime(),
    );
}

/** True while a memory is still being ingested (not ready, not failed). */
export function isProcessing(item: KnowledgeItem): boolean {
  const status = getProcessingStatus(item.pipeline);
  return status === "uploading" || status === "processing";
}

/** A memory that finished processing and is ready to recall. */
export function isReady(item: KnowledgeItem): boolean {
  return getProcessingStatus(item.pipeline) === "ready";
}

/** Favorited memories, newest first. */
export function favorites(items: KnowledgeItem[]): KnowledgeItem[] {
  return byNewest(items.filter((i) => i.isFavorite));
}

/** Items in a given workspace. */
export function inWorkspace(items: KnowledgeItem[], workspaceId: ID): KnowledgeItem[] {
  return items.filter((i) => i.workspaceId === workspaceId);
}

/** Items in a given collection. */
export function inCollection(items: KnowledgeItem[], collectionId: ID): KnowledgeItem[] {
  return items.filter((i) => i.collectionId === collectionId);
}

/** First name from a full name, for greetings. */
export function firstName(name: string | undefined): string {
  if (!name) return "there";
  return name.trim().split(/\s+/)[0] || "there";
}

/** The most recent timestamp across items, or `fallback` when empty. */
export function latestTimestamp(
  items: KnowledgeItem[],
  fallback: string,
): string {
  if (items.length === 0) return fallback;
  return items.reduce(
    (latest, i) => (updatedMs(i) > new Date(latest).getTime() ? i.updatedAt : latest),
    items[0].updatedAt,
  );
}

/** Up to `n` distinct thumbnail URLs from items, for collection/workspace covers. */
export function coverThumbnails(items: KnowledgeItem[], n = 4): string[] {
  const urls: string[] = [];
  for (const item of byNewest(items)) {
    if (item.thumbnailUrl && !urls.includes(item.thumbnailUrl)) {
      urls.push(item.thumbnailUrl);
      if (urls.length >= n) break;
    }
  }
  return urls;
}
