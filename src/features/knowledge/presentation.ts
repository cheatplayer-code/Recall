import type { KnowledgeItem, Mood, PipelineStage } from "@/types";

/**
 * Presentation-only mapping of the (technical) pipeline domain into Recall's
 * human voice. The domain model in `lib/pipeline.ts` is untouched — we only
 * translate it for the UI. Memory language, never CI/CD language.
 */
export const STAGE_PHRASE: Record<PipelineStage, string> = {
  uploading: "Saving…",
  processing: "Waking up…",
  extracting: "Reading…",
  chunking: "Making sense…",
  embedding: "Remembering…",
  indexing: "Filing it away…",
  ready: "Remembered",
  failed: "Couldn’t remember",
};

/**
 * Mood → glow color (CSS custom property). Drives the soft light a memory
 * artifact emits, so the grid reads as an emotional map rather than a table.
 */
export function moodGlow(mood: Mood | undefined): string {
  switch (mood) {
    case "positive":
      return "var(--mood-positive)";
    case "negative":
      return "var(--mood-negative)";
    case "mixed":
      return "var(--mood-mixed)";
    case "neutral":
    default:
      return "var(--mood-neutral)";
  }
}

/** The readable source of a saved link, e.g. "example.com". Presentation only. */
export function sourceHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** A photo-like (visual) memory leads with its image (or a mood-lit panel). */
export function isPhotoMemory(item: KnowledgeItem): boolean {
  return (
    item.type === "photo" ||
    item.type === "video" ||
    Boolean(item.thumbnailUrl)
  );
}

/** How much a memory "deserves" to become a hero — earned, not random. */
function heroScore(item: KnowledgeItem): number {
  let score = 0;
  if (isPhotoMemory(item)) score += 4;
  if (item.isFavorite) score += 2;
  if ((item.excerpt?.length ?? 0) > 140) score += 1;
  return score;
}

/**
 * Picks at most one hero memory for a group — the standout moment that becomes a
 * larger editorial block — and returns the rest for the masonry. Heroes are
 * selective (strong signal required) so the feed's rhythm stays irregular.
 */
export function selectHero(items: KnowledgeItem[]): {
  hero: KnowledgeItem | null;
  rest: KnowledgeItem[];
} {
  let hero: KnowledgeItem | null = null;
  let best = 0;
  for (const item of items) {
    const score = heroScore(item);
    if (score > best) {
      best = score;
      hero = item;
    }
  }
  if (hero && best >= 4) {
    return { hero, rest: items.filter((i) => i !== hero) };
  }
  return { hero: null, rest: items };
}
