import {
  PenLine,
  Mic,
  Camera,
  FileText,
  Link2,
  Lightbulb,
  FileType,
  Video,
  Globe,
  Bookmark,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import type { KnowledgeType } from "@/types";

export interface KnowledgeTypeMeta {
  label: string;
  icon: LucideIcon;
}

/** Display metadata for each knowledge source type. */
export const KNOWLEDGE_TYPE_META: Record<KnowledgeType, KnowledgeTypeMeta> = {
  note: { label: "Note", icon: PenLine },
  voice: { label: "Voice", icon: Mic },
  photo: { label: "Photo", icon: Camera },
  document: { label: "Document", icon: FileText },
  link: { label: "Link", icon: Link2 },
  idea: { label: "Idea", icon: Lightbulb },
  pdf: { label: "PDF", icon: FileType },
  video: { label: "Video", icon: Video },
  website: { label: "Website", icon: Globe },
  bookmark: { label: "Bookmark", icon: Bookmark },
  chat: { label: "Chat", icon: MessageSquare },
};

/**
 * Order used for the type filter chips. Covers the supported source types;
 * `idea` stays in the metadata above (legacy items still render) but is omitted
 * here to keep the filter row calm.
 */
export const KNOWLEDGE_TYPE_ORDER: KnowledgeType[] = [
  "note",
  "document",
  "pdf",
  "photo",
  "voice",
  "video",
  "link",
  "website",
  "bookmark",
  "chat",
];

export type SortKey = "newest" | "oldest" | "title" | "updated";

export interface SortOption {
  key: SortKey;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "updated", label: "Recently updated" },
  { key: "title", label: "Title A–Z" },
];
