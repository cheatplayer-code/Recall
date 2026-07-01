import type { CreateKnowledgeInput } from "@/services";

import type { UploadSourceMeta } from "../constants";
import {
  knowledgeTypeFromFile,
  titleFromFileName,
  objectUrlsForFile,
} from "./file-type";

const EXCERPT_LENGTH = 140;

function makeExcerpt(text: string): string | undefined {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;
  return trimmed.length > EXCERPT_LENGTH
    ? `${trimmed.slice(0, EXCERPT_LENGTH)}…`
    : trimmed;
}

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function defaultTitle(source: UploadSourceMeta, value: string): string {
  if (source.inputKind === "url") {
    return hostFromUrl(value) ?? (value || source.label);
  }
  if (source.inputKind === "text") {
    const firstLine = value.trim().split("\n")[0]?.replace(/^#+\s*/, "");
    return firstLine?.slice(0, 80) || `Untitled ${source.label.toLowerCase()}`;
  }
  return value || source.label;
}

export function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean);
}

/**
 * The single source of truth for building an ingestion payload from a file.
 * Used by BOTH drag-and-drop Upload and Capture, so a dropped image and a
 * captured image produce an identical {@link CreateKnowledgeInput} — same type
 * resolution, same object-URL previews. No file-creation logic lives elsewhere.
 */
export function buildInputFromFile(file: File): CreateKnowledgeInput {
  const type = knowledgeTypeFromFile(file);
  return {
    type,
    title: titleFromFileName(file.name),
    content: file.name,
    excerpt: file.name,
    // Carry the actual file so the document service can upload its bytes.
    file,
    ...objectUrlsForFile(file, type),
  };
}

export interface UploadFormValues {
  /** Selected file, for file sources. */
  file?: File | null;
  /** URL/text value, for url/text sources. */
  text?: string;
  title: string;
  tags: string;
}

/**
 * Map a Capture form into the ingestion payload. File sources delegate to
 * {@link buildInputFromFile} (so previews work exactly like Upload); url/text
 * sources build a text-based input. User title/tags override derived defaults.
 */
export function buildCreateInput(
  source: UploadSourceMeta,
  values: UploadFormValues,
): CreateKnowledgeInput {
  const tags = parseTags(values.tags);
  const title = values.title.trim();

  if (source.inputKind === "file" && values.file) {
    const base = buildInputFromFile(values.file);
    return { ...base, title: title || base.title, tags };
  }

  const text = values.text ?? "";
  return {
    type: source.knowledgeType,
    title: title || defaultTitle(source, text),
    content: text,
    excerpt: makeExcerpt(text),
    tags,
    sourceUrl: source.inputKind === "url" ? text : undefined,
  };
}
