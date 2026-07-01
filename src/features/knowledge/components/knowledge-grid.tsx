"use client";

import { motion, useReducedMotion } from "framer-motion";

import { surfaceVariants } from "@/lib/motion";
import type { KnowledgeItem } from "@/types";

import { KnowledgeCard, HeroMemory } from "./knowledge-card";

/** A time bucket of memories: an editorial label, an optional hero, the rest. */
export interface MemoryGroup {
  key: string;
  label: string;
  sublabel?: string;
  hero: KnowledgeItem | null;
  items: KnowledgeItem[];
}

// Fewer, wider columns than a Pinterest grid — the feed reads editorial.
const COLUMNS = "columns-1 gap-6 sm:columns-2 lg:columns-3";

/** The Memory Feed — time-grouped, hero-led, memories surfacing as you scroll. */
export function MemoryFeed({ groups }: { groups: MemoryGroup[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-16">
      {groups.map((group) => (
        <section key={group.key}>
          <GroupHeader label={group.label} sublabel={group.sublabel} />

          {group.hero && (
            <div className="mb-6">
              <HeroMemory item={group.hero} />
            </div>
          )}

          {group.items.length > 0 && (
            // Each card runs its OWN in-view reveal. A card prepended after the
            // initial load (e.g. a just-uploaded item) mounts and triggers its own
            // observer immediately — so it never stays stuck at the hidden
            // (opacity:0) variant the way a parent-orchestrated `once` reveal left it.
            <div className={COLUMNS}>
              {group.items.map((item) => (
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
          )}
        </section>
      ))}
    </div>
  );
}

function GroupHeader({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <header className="mb-6">
      <div className="flex items-baseline gap-3">
        <h2 className="font-editorial text-2xl tracking-tight">{label}</h2>
        {sublabel && (
          <span className="text-xs text-muted-foreground/50">{sublabel}</span>
        )}
      </div>
      <div className="mt-3 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
    </header>
  );
}

const SKELETON_HEIGHTS = [220, 280, 180, 240, 200, 300];

/** Loading variant — varied-height placeholders matching the masonry rhythm. */
export function MemoryFeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="aspect-[2/1] animate-pulse rounded-3xl bg-card/50 ring-1 ring-white/5" />
      <div className={COLUMNS}>
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="mb-6 break-inside-avoid">
            <div
              className="animate-pulse rounded-xl bg-card/40 ring-1 ring-white/5"
              style={{ height: h }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
