import {
  coverThumbnails,
  inCollection,
  latestTimestamp,
} from "@/lib/knowledge-select";
import type { Collection, KnowledgeItem } from "@/types";

/** A collection enriched with live, client-derived facets for its card/detail. */
export interface CollectionView extends Collection {
  members: KnowledgeItem[];
  itemCount: number;
  coverImageUrls: string[];
  lastUpdatedAt: string;
}

/**
 * Combine a collection with the loaded knowledge items to compute its real
 * member list, count, cover thumbnails and last-updated time. The backend DTO
 * carries no counts, so these are derived here — the single place that knows how.
 */
export function deriveCollection(
  collection: Collection,
  allItems: KnowledgeItem[],
): CollectionView {
  const members = inCollection(allItems, collection.id);
  return {
    ...collection,
    members,
    itemCount: members.length,
    coverImageUrls: coverThumbnails(members, 4),
    lastUpdatedAt: latestTimestamp(members, collection.updatedAt),
  };
}

/** Derive views for many collections at once. */
export function deriveCollections(
  collections: Collection[],
  allItems: KnowledgeItem[],
): CollectionView[] {
  return collections.map((c) => deriveCollection(c, allItems));
}
