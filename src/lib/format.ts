import type { ISODateString } from "@/types";

/** "Jun 24, 2026" — stable absolute date. */
export function formatDate(iso: ISODateString): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Human-friendly relative date: "Today", "Yesterday", "3d ago", "2w ago", or an
 * absolute date for anything older than ~4 weeks. Computed against the current
 * time, so call it from client components only.
 */
export function formatRelativeDate(iso: ISODateString): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(diffMs / dayMs);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 28) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(iso);
}

/** "09:31" — short local time, for pipeline stage timestamps. */
export function formatTime(iso: ISODateString): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
