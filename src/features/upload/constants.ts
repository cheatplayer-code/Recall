import {
  FileText,
  Globe,
  PlayCircle,
  FileType,
  Type,
  Image as ImageIcon,
  AudioLines,
  type LucideIcon,
} from "lucide-react";

import type { KnowledgeType } from "@/types";

export type UploadSourceId =
  | "pdf"
  | "url"
  | "youtube"
  | "markdown"
  | "text"
  | "image"
  | "audio";

/** How the user provides the content for a given source. */
export type UploadInputKind = "file" | "url" | "text";

export interface UploadSourceMeta {
  id: UploadSourceId;
  label: string;
  icon: LucideIcon;
  inputKind: UploadInputKind;
  /** Knowledge item type this source produces. */
  knowledgeType: KnowledgeType;
  /** `accept` attribute for file inputs. */
  accept?: string;
  /** Placeholder for url/text inputs. */
  placeholder?: string;
  hint: string;
}

export const UPLOAD_SOURCES: UploadSourceMeta[] = [
  {
    id: "pdf",
    label: "PDF",
    icon: FileText,
    inputKind: "file",
    knowledgeType: "document",
    accept: "application/pdf,.pdf",
    hint: "We'll extract the text and summarize it.",
  },
  {
    id: "url",
    label: "URL",
    icon: Globe,
    inputKind: "url",
    knowledgeType: "link",
    placeholder: "https://example.com/article",
    hint: "Paste a link to save and summarize the page.",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: PlayCircle,
    inputKind: "url",
    knowledgeType: "link",
    placeholder: "https://youtube.com/watch?v=…",
    hint: "We'll transcribe and summarize the video.",
  },
  {
    id: "markdown",
    label: "Markdown",
    icon: FileType,
    inputKind: "text",
    knowledgeType: "note",
    placeholder: "# Paste your markdown here",
    hint: "Paste Markdown — formatting is preserved.",
  },
  {
    id: "text",
    label: "Plain Text",
    icon: Type,
    inputKind: "text",
    knowledgeType: "note",
    placeholder: "Write or paste any text…",
    hint: "Any free-form text becomes a memory.",
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    inputKind: "file",
    knowledgeType: "photo",
    accept: "image/*",
    hint: "We'll detect objects, people and place.",
  },
  {
    id: "audio",
    label: "Audio",
    icon: AudioLines,
    inputKind: "file",
    knowledgeType: "voice",
    accept: "audio/*",
    hint: "We'll transcribe and summarize the recording.",
  },
];

export const UPLOAD_SOURCE_MAP: Record<UploadSourceId, UploadSourceMeta> =
  Object.fromEntries(UPLOAD_SOURCES.map((s) => [s.id, s])) as Record<
    UploadSourceId,
    UploadSourceMeta
  >;
