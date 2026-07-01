import type { KnowledgeItem, KnowledgeType } from "@/types";

/** The named result buckets the Search screen renders, in display order. */
export type SearchGroupKey =
  | "documents"
  | "images"
  | "pdfs"
  | "notes"
  | "links"
  | "media"
  | "chats";

export interface SearchGroupMeta {
  key: SearchGroupKey;
  label: string;
  types: KnowledgeType[];
}

/**
 * Maps knowledge types onto the user-facing search groups. "Chats" is sourced
 * from conversations (handled separately) plus any `chat`-typed memory. Keeping
 * this as data makes the grouping trivially extensible.
 */
export const SEARCH_GROUPS: SearchGroupMeta[] = [
  { key: "documents", label: "Documents", types: ["document"] },
  { key: "images", label: "Images", types: ["photo"] },
  { key: "pdfs", label: "PDFs", types: ["pdf"] },
  { key: "notes", label: "Notes", types: ["note", "idea"] },
  { key: "links", label: "Links", types: ["link", "website", "bookmark"] },
  { key: "media", label: "Audio & Video", types: ["voice", "video"] },
  { key: "chats", label: "Chats", types: ["chat"] },
];

const TYPE_TO_GROUP = new Map<KnowledgeType, SearchGroupKey>();
for (const group of SEARCH_GROUPS) {
  for (const type of group.types) TYPE_TO_GROUP.set(type, group.key);
}

/** Which search group a memory belongs to. */
export function groupForType(type: KnowledgeType): SearchGroupKey {
  return TYPE_TO_GROUP.get(type) ?? "notes";
}

export interface GroupedMemories {
  key: SearchGroupKey;
  label: string;
  items: KnowledgeItem[];
}

/** Split memories into the named groups, preserving group order and dropping empties. */
export function groupMemories(items: KnowledgeItem[]): GroupedMemories[] {
  const byKey = new Map<SearchGroupKey, KnowledgeItem[]>();
  for (const item of items) {
    const key = groupForType(item.type);
    const list = byKey.get(key);
    if (list) list.push(item);
    else byKey.set(key, [item]);
  }
  return SEARCH_GROUPS.filter((g) => (byKey.get(g.key)?.length ?? 0) > 0).map(
    (g) => ({ key: g.key, label: g.label, items: byKey.get(g.key) as KnowledgeItem[] }),
  );
}
