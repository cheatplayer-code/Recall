import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  /** Quiet count or context shown next to the title. */
  sublabel?: string;
  /** "See all" destination — renders a quiet link on the right. */
  href?: string;
  /** Custom right-aligned action (overrides `href`). */
  action?: ReactNode;
  className?: string;
}

/**
 * A calm section header for dashboard-style screens: an editorial title, an
 * optional quiet count, and an optional "See all" link. Reused by Home and
 * Workspaces so every section reads with the same rhythm.
 */
export function SectionHeading({
  title,
  sublabel,
  href,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex items-baseline justify-between gap-3", className)}>
      <div className="flex items-baseline gap-3">
        <h2 className="font-editorial text-xl tracking-tight">{title}</h2>
        {sublabel && (
          <span className="text-xs text-muted-foreground/60">{sublabel}</span>
        )}
      </div>
      {action ??
        (href ? (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            See all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null)}
    </div>
  );
}
