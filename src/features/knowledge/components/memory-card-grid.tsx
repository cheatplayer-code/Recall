"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { surfaceVariants } from "@/lib/motion";
import type { KnowledgeItem } from "@/types";

import { KnowledgeCard } from "./knowledge-card";

/** Column density presets — all collapse to a single column on mobile. */
const COLUMN_CLASS = {
  2: "columns-1 gap-6 sm:columns-2",
  3: "columns-1 gap-6 sm:columns-2 lg:columns-3",
  4: "columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4",
} as const;

export interface MemoryCardGridProps {
  items: KnowledgeItem[];
  /** Masonry column count at the widest breakpoint. Default 3. */
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * A flat masonry of {@link KnowledgeCard}s — the same editorial rhythm as the
 * Memory Feed, without the time grouping. Reused anywhere a plain list of
 * memories is shown (Home sections, Collection detail, Search results, Workspace
 * pages). Each card runs its own in-view reveal so newly-inserted items animate
 * in reliably.
 */
export function MemoryCardGrid({
  items,
  columns = 3,
  className,
}: MemoryCardGridProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn(COLUMN_CLASS[columns], className)}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="mb-6 break-inside-avoid"
          variants={reduce ? undefined : surfaceVariants}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        >
          <KnowledgeCard item={item} />
        </motion.div>
      ))}
    </div>
  );
}
