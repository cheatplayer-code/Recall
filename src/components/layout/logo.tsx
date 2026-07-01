import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Recall wordmark. The mark is a small aurora — the AI made visible as light —
 * paired with the wordmark set in the editorial voice.
 */
export function Logo({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/home"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Recall home"
    >
      <span
        aria-hidden="true"
        className="bg-aurora animate-aurora relative grid size-7 shrink-0 place-items-center rounded-[0.6rem] text-sm font-medium text-white shadow-[0_0_16px_oklch(0.74_0.15_288_/_0.45)] ring-1 ring-white/20"
      >
        R
      </span>
      {!collapsed && (
        <span className="font-editorial text-xl tracking-tight text-foreground">
          Recall
        </span>
      )}
    </Link>
  );
}
