/* eslint-disable @next/next/no-img-element */
"use client";

import { memo, useRef } from "react";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import { getProcessingStatus } from "@/lib/pipeline";
import type { KnowledgeItem } from "@/types";

import { moodGlow, sourceHost, isPhotoMemory } from "../presentation";
import { KnowledgeStatusBadge } from "./knowledge-status-badge";
import { MemoryMenu } from "./memory-menu";

function getIsProcessing(item: KnowledgeItem): boolean {
  const s = getProcessingStatus(item.pipeline);
  return s === "uploading" || s === "processing";
}

/**
 * A memory artifact. Composition follows the *kind* of memory so the type reads
 * instantly without an icon: a photo leads with its image, a note reads like a
 * journal page, an idea floats as text, a voice note shows a waveform, a
 * document feels like a sheet, a link looks collected from the web.
 */
export const KnowledgeCard = memo(function KnowledgeCard({
  item,
}: {
  item: KnowledgeItem;
}) {
  const inner = isPhotoMemory(item) ? (
    <PhotoMemory item={item} />
  ) : item.type === "voice" ? (
    <VoiceMemory item={item} />
  ) : item.type === "idea" ? (
    <IdeaMemory item={item} />
  ) : item.type === "document" || item.type === "pdf" ? (
    <DocumentMemory item={item} />
  ) : item.type === "link" ||
    item.type === "website" ||
    item.type === "bookmark" ? (
    <LinkMemory item={item} />
  ) : (
    <NoteMemory item={item} />
  );

  return (
    <div className="group relative">
      <Link
        href={`/knowledge/${item.id}`}
        aria-label={item.title}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {inner}
      </Link>
      <MemoryMenu
        item={item}
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[open=true]:opacity-100"
      />
    </div>
  );
});

/* ───────────────────────── hero ───────────────────────── */

/** The standout memory of a group, rendered as a wide editorial block. */
export function HeroMemory({ item }: { item: KnowledgeItem }) {
  return (
    <Link
      href={`/knowledge/${item.id}`}
      aria-label={item.title}
      className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {isPhotoMemory(item) ? <HeroPhoto item={item} /> : <HeroText item={item} />}
    </Link>
  );
}

function HeroPhoto({ item }: { item: KnowledgeItem }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const glow = moodGlow(item.ai?.mood);
  const isProcessing = getIsProcessing(item);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-24, 24]);

  return (
    <figure
      ref={ref}
      className="relative aspect-[16/9] overflow-hidden rounded-3xl ring-1 ring-white/5"
    >
      {item.type === "video" && item.fileUrl ? (
        <video
          src={`${item.fileUrl}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      ) : item.thumbnailUrl ? (
        <motion.img
          src={item.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ y }}
          className="absolute inset-0 size-full scale-110 object-cover"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(70% 120% at 22% 8%, color-mix(in oklch, ${glow} 46%, transparent), transparent 60%), radial-gradient(90% 120% at 100% 100%, color-mix(in oklch, ${glow} 22%, transparent), var(--card) 72%)`,
            }}
          />
          <div className="bg-aurora animate-aurora absolute inset-0 opacity-[0.14]" />
        </>
      )}
      {item.type === "video" && <PlayOverlay />}

      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 pt-20 sm:p-8">
        <h3 className="font-editorial max-w-xl text-2xl leading-tight text-white sm:text-[2rem]">
          {item.title}
        </h3>
        {item.ai?.summary && (
          <p className="font-editorial mt-2 line-clamp-2 max-w-lg text-base italic leading-relaxed text-white/75">
            {item.ai.summary}
          </p>
        )}
        <time
          dateTime={item.createdAt}
          className="mt-3 block text-xs uppercase tracking-[0.1em] text-white/50"
        >
          {formatRelativeDate(item.occurredAt ?? item.createdAt)}
        </time>
      </figcaption>

      {item.isFavorite && (
        <Star
          className="absolute right-5 top-5 size-4 fill-current text-white/90 drop-shadow"
          aria-hidden="true"
        />
      )}
      {isProcessing && (
        <div className="absolute left-5 top-5">
          <KnowledgeStatusBadge pipeline={item.pipeline} />
        </div>
      )}
    </figure>
  );
}

function HeroText({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);

  return (
    <article className="relative overflow-hidden rounded-3xl bg-card/50 p-8 ring-1 ring-white/5 sm:p-10">
      <MoodWash glow={glow} tall />
      <div className="relative max-w-2xl">
        <h3 className="font-editorial text-2xl leading-tight sm:text-3xl">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="font-editorial mt-4 text-lg leading-relaxed text-muted-foreground">
            {item.excerpt}
          </p>
        )}
        <MetaRow item={item} className="mt-6" />
      </div>
    </article>
  );
}

/* ─────────────────────── compositions ─────────────────────── */

function PhotoMemory({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);
  const isProcessing = getIsProcessing(item);

  return (
    <figure>
      <div
        className={cn(
          "relative max-h-[24rem] overflow-hidden rounded-xl",
          photoAspect(item.id),
        )}
      >
        {item.type === "video" && item.fileUrl ? (
          <video
            src={`${item.fileUrl}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none size-full object-cover"
          />
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div
            className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{
              background: `radial-gradient(120% 90% at 50% 0%, color-mix(in oklch, ${glow} 34%, transparent), var(--card) 78%)`,
            }}
          />
        )}
        {item.type === "video" && <PlayOverlay />}
        {item.isFavorite && (
          <Star
            className="absolute right-3 top-3 size-3.5 fill-current text-white/90 drop-shadow"
            aria-hidden="true"
          />
        )}
        {isProcessing && (
          <div className="absolute left-3 top-3">
            <KnowledgeStatusBadge pipeline={item.pipeline} />
          </div>
        )}
      </div>
      <figcaption className="px-1 pt-2.5">
        <h3 className="font-editorial line-clamp-2 text-sm leading-snug">
          {item.title}
        </h3>
        <MemoryDate item={item} className="mt-0.5" />
      </figcaption>
    </figure>
  );
}

function NoteMemory({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);
  return (
    <article className="relative overflow-hidden rounded-xl bg-card/30 p-5 transition-colors duration-300 group-hover:bg-card/50">
      <MoodWash glow={glow} />
      <div className="relative">
        <h3 className="font-editorial text-lg leading-snug">{item.title}</h3>
        {item.excerpt && (
          <p className="font-editorial mt-2 line-clamp-5 text-[0.95rem] leading-relaxed text-muted-foreground">
            {item.excerpt}
          </p>
        )}
        <MetaRow item={item} className="mt-4" />
      </div>
    </article>
  );
}

function IdeaMemory({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);
  return (
    <article className="px-5 py-6 transition-opacity duration-300">
      <div className="flex gap-3">
        <span
          className="mt-[0.55em] size-1.5 shrink-0 rounded-full"
          style={{ background: glow }}
          aria-hidden="true"
        />
        <h3 className="font-editorial text-xl leading-snug">{item.title}</h3>
      </div>
      <MetaRow item={item} className="mt-3 pl-6" />
    </article>
  );
}

function VoiceMemory({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);
  return (
    <article className="relative overflow-hidden rounded-xl bg-card/40 p-5 transition-colors duration-300 group-hover:bg-card/60">
      <MoodWash glow={glow} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-white/15"
            style={{ background: `color-mix(in oklch, ${glow} 22%, transparent)` }}
          >
            <Play
              className="size-3.5 translate-x-px fill-current text-foreground/80"
              aria-hidden="true"
            />
          </span>
          <Waveform glow={glow} bars={waveformFor(item.id)} />
        </div>
        <h3 className="font-editorial mt-3 line-clamp-2 text-base leading-snug">
          {item.title}
        </h3>
        <MetaRow item={item} className="mt-2" />
      </div>
    </article>
  );
}

function DocumentMemory({ item }: { item: KnowledgeItem }) {
  return (
    <article className="rounded-xl bg-card/70 p-5 ring-1 ring-white/[0.06]">
      <h3 className="font-editorial text-base leading-snug">{item.title}</h3>
      <div className="my-3 h-px w-full bg-white/[0.08]" aria-hidden="true" />
      {item.excerpt && (
        <p className="font-editorial line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {item.excerpt}
        </p>
      )}
      <MetaRow item={item} className="mt-4" />
    </article>
  );
}

function LinkMemory({ item }: { item: KnowledgeItem }) {
  const host = sourceHost(item.content);
  return (
    <article className="rounded-xl bg-card/40 p-4 transition-colors duration-300 group-hover:bg-card/60">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[0.6rem] font-semibold uppercase text-muted-foreground">
          {host?.[0] ?? "↗"}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {host ?? "Saved link"}
        </span>
      </div>
      <h3 className="font-editorial text-base leading-snug">{item.title}</h3>
      {item.excerpt && (
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.excerpt}
        </p>
      )}
      <MetaRow item={item} className="mt-3" />
    </article>
  );
}

/* ───────────────────────── shared ───────────────────────── */

/** Centered play affordance shown over video media (card + hero). */
function PlayOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <span className="grid size-12 place-items-center rounded-full bg-background/70 ring-1 ring-white/15 backdrop-blur">
        <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />
      </span>
    </div>
  );
}

function MoodWash({ glow, tall = false }: { glow: string; tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0",
        tall ? "h-28" : "h-16",
      )}
      style={{
        background: `radial-gradient(90% 100% at 50% 0%, color-mix(in oklch, ${glow} 14%, transparent), transparent 80%)`,
      }}
    />
  );
}

function MemoryDate({
  item,
  className,
}: {
  item: KnowledgeItem;
  className?: string;
}) {
  return (
    <time
      dateTime={item.createdAt}
      className={cn(
        "font-editorial text-xs italic text-muted-foreground/60",
        className,
      )}
    >
      {formatRelativeDate(item.occurredAt ?? item.createdAt)}
    </time>
  );
}

/** Quiet metadata — composition signals type, so no type icon here. */
function MetaRow({
  item,
  className,
}: {
  item: KnowledgeItem;
  className?: string;
}) {
  const isProcessing = getIsProcessing(item);

  if (isProcessing) {
    return (
      <div className={className}>
        <KnowledgeStatusBadge pipeline={item.pipeline} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <MemoryDate item={item} />
      {item.isFavorite && (
        <Star
          className="ml-auto size-3 fill-current text-mood-positive"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function Waveform({ glow, bars }: { glow: string; bars: number[] }) {
  return (
    <div className="flex h-9 flex-1 items-center gap-1" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full opacity-70"
          style={{ height: `${h}%`, background: glow }}
        />
      ))}
    </div>
  );
}

/** A stable, per-memory waveform so two voice notes never look identical. */
function waveformFor(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  return Array.from({ length: 22 }, () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return 26 + (seed % 74);
  });
}

const PHOTO_ASPECTS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[5/6]",
];

/** Deterministic, stable aspect per item so photos vary like real photos do. */
function photoAspect(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PHOTO_ASPECTS[h % PHOTO_ASPECTS.length];
}
