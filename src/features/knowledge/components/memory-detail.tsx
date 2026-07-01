/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Download,
  MapPin,
  Users,
  CalendarDays,
  Clock,
  Tag,
  Boxes,
  Quote,
  Play,
  Star,
  ListChecks,
} from "lucide-react";

import {
  PageContainer,
  LoadingState,
  EmptyState,
} from "@/components/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeDate } from "@/lib/format";
import {
  getProcessingStatus,
  PIPELINE_STAGE_META,
  PIPELINE_STAGE_SEQUENCE,
} from "@/lib/pipeline";
import type { KnowledgeItem, PipelineStage } from "@/types";

import {
  useKnowledgeItem,
  useMarkAccessed,
  useRelatedKnowledge,
  useToggleFavorite,
} from "../hooks/use-knowledge";
import { KNOWLEDGE_TYPE_META } from "../constants";
import { moodGlow, isPhotoMemory } from "../presentation";
import { deriveRag, EMBEDDING_STATUS_LABEL } from "../lib/rag";
import { askHref } from "../lib/chat-bridge";
import { KnowledgeStatusBadge } from "./knowledge-status-badge";
import { KnowledgeTypeBadge } from "./knowledge-type-badge";
import { MemoryMenu } from "./memory-menu";
import { KnowledgeCard } from "./knowledge-card";

/** Trigger a browser download of `blob` named `filename`. */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Original filename for a stored file: the storage key minus its uuid prefix. */
function downloadName(item: KnowledgeItem): string {
  try {
    const last = new URL(item.fileUrl as string).pathname.split("/").pop() ?? "";
    const name = decodeURIComponent(last).replace(/^[0-9a-f]{32}_/i, "");
    if (name) return name;
  } catch {
    /* fall through */
  }
  return item.excerpt?.includes(".") ? item.excerpt : item.title;
}

/**
 * Download the memory. When a real file is stored it's served at `fileUrl`, so
 * fetch and save the actual bytes. Only fall back to a text export when there is
 * no stored file (e.g. a typed note).
 */
async function downloadMemory(item: KnowledgeItem) {
  if (item.fileUrl) {
    try {
      const res = await fetch(item.fileUrl);
      if (res.ok) {
        saveBlob(await res.blob(), downloadName(item));
        return;
      }
    } catch {
      /* network/CORS issue — fall back to the text export below */
    }
  }
  const body = item.content ?? item.excerpt ?? item.title;
  saveBlob(new Blob([body], { type: "text/plain;charset=utf-8" }), `${item.title}.txt`);
}

/**
 * The full memory experience: header, metadata, preview, extracted content,
 * processing status, RAG facets, related memories, AI actions and a citations
 * placeholder. All data flows through hooks → services; this composes existing
 * Recall components and tokens — no new design language.
 */
export function MemoryDetail({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { data: item, isLoading } = useKnowledgeItem(itemId);
  const { data: related = [] } = useRelatedKnowledge(itemId);
  const markAccessed = useMarkAccessed();
  const toggleFavorite = useToggleFavorite();
  const marked = useRef(false);

  useEffect(() => {
    if (item && !marked.current) {
      marked.current = true;
      markAccessed.mutate(item.id);
    }
  }, [item, markAccessed]);

  return (
    <PageContainer>
      <Link
        href="/knowledge"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-4",
        })}
      >
        <ArrowLeft className="size-4" />
        Back to Knowledge
      </Link>

      {isLoading && <LoadingState label="Opening memory…" />}

      {!isLoading && !item && (
        <EmptyState
          icon={Sparkles}
          title="Memory not found"
          description="This memory doesn't exist or may have been removed."
        />
      )}

      {!isLoading && item && (
        <MemoryBody
          item={item}
          related={related}
          onToggleFavorite={() => toggleFavorite.mutate(item)}
          onDeleted={() => router.push("/knowledge")}
        />
      )}
    </PageContainer>
  );
}

function MemoryBody({
  item,
  related,
  onToggleFavorite,
  onDeleted,
}: {
  item: KnowledgeItem;
  related: KnowledgeItem[];
  onToggleFavorite: () => void;
  onDeleted: () => void;
}) {
  const rag = deriveRag(item);
  const sourceUrl =
    item.sourceUrl ??
    (item.type === "link" || item.type === "website" || item.type === "bookmark"
      ? item.content
      : undefined);
  const isUrl = Boolean(sourceUrl && /^https?:\/\//.test(sourceUrl));

  return (
    <div>
      {/* Header */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <KnowledgeTypeBadge type={item.type} />
          <KnowledgeStatusBadge pipeline={item.pipeline} />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-pressed={item.isFavorite}
              aria-label={item.isFavorite ? "Remove favorite" : "Add favorite"}
              onClick={onToggleFavorite}
              className="rounded-full"
            >
              <Star
                className={cn(
                  "size-4",
                  item.isFavorite
                    ? "fill-current text-mood-positive"
                    : "text-muted-foreground",
                )}
              />
            </Button>
            <MemoryMenu item={item} onDeleted={onDeleted} />
          </div>
        </div>

        <h1 className="font-editorial mt-4 break-words text-3xl leading-tight sm:text-4xl">
          {item.title}
        </h1>
        {item.ai?.summary && (
          <p className="font-editorial mt-3 max-w-2xl break-words text-lg italic leading-relaxed text-muted-foreground">
            {item.ai.summary}
          </p>
        )}
      </header>

      {/* AI actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href={askHref(item)} className={buttonVariants({ size: "lg" })}>
          <Sparkles className="size-4" />
          Ask AI about this memory
        </Link>
        {isUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <ExternalLink className="size-4" />
            Open source
          </a>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={() => void downloadMemory(item)}
        >
          <Download className="size-4" />
          Download
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        {/* Main column */}
        <div className="space-y-8">
          <Preview item={item} />
          <AIInsights item={item} />
          <ExtractedContent item={item} />
          <RelatedMemories related={related} />
          <CitationsPlaceholder />
        </div>

        {/* Aside */}
        <aside className="space-y-4">
          <ProcessingPanel item={item} />
          <DetailsPanel item={item} />
          <MemoryIndexPanel
            documentId={rag.documentId}
            embeddingStatus={EMBEDDING_STATUS_LABEL[rag.embeddingStatus]}
            chunkCount={rag.chunkCount}
            pageCount={rag.pageCount}
          />
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────── sections ─────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/55">
      {children}
    </h2>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card/50 p-5 ring-1 ring-white/[0.06]">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

function Preview({ item }: { item: KnowledgeItem }) {
  const glow = moodGlow(item.ai?.mood);

  // Video: a real player on the stored file.
  if (item.type === "video" && item.fileUrl) {
    return (
      <section>
        <SectionLabel>Preview</SectionLabel>
        <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/[0.06]">
          <video
            src={item.fileUrl}
            controls
            playsInline
            preload="metadata"
            poster={item.thumbnailUrl ?? item.previewUrl ?? undefined}
            className="max-h-[28rem] w-full object-contain"
          />
        </div>
      </section>
    );
  }

  // Visual media. Images render their actual file; video renders a poster
  // (never the video blob inside <img>), falling back to a mood-lit panel.
  if (isPhotoMemory(item)) {
    const imageSrc =
      item.type === "video"
        ? item.previewUrl ?? item.thumbnailUrl
        : item.previewUrl ?? item.thumbnailUrl ?? item.fileUrl;
    return (
      <section>
        <SectionLabel>Preview</SectionLabel>
        <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background: `radial-gradient(80% 120% at 30% 10%, color-mix(in oklch, ${glow} 40%, transparent), var(--card) 75%)`,
              }}
            />
          )}
          {item.type === "video" && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-background/70 ring-1 ring-white/15 backdrop-blur">
                <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // PDF / document: a backend-rendered first-page image when available, else a
  // document-sheet placeholder.
  if (item.type === "pdf" || item.type === "document") {
    return (
      <section>
        <SectionLabel>Preview</SectionLabel>
        {item.previewUrl ? (
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
            <img
              src={item.previewUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="max-h-[28rem] w-full object-contain bg-black/20"
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-card/70 p-6 ring-1 ring-white/[0.06]">
            <div className="space-y-2.5">
              {[100, 92, 96, 70, 88, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded bg-white/[0.06]"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Audio: a waveform placeholder until the backend renders one.
  if (item.type === "voice") {
    return (
      <section>
        <SectionLabel>Preview</SectionLabel>
        <div className="rounded-2xl bg-card/60 p-6 ring-1 ring-white/[0.06]">
          <PreviewWaveform id={item.id} glow={glow} />
        </div>
      </section>
    );
  }

  return null;
}

/** A stable, per-item set of waveform bar heights (pure, computed off-render). */
function waveformBars(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  return Array.from({ length: 48 }, () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return 20 + (seed % 80);
  });
}

/** A deterministic, per-item waveform — a placeholder until backend audio art. */
function PreviewWaveform({ id, glow }: { id: string; glow: string }) {
  return (
    <div className="flex h-16 items-center gap-1" aria-hidden="true">
      {waveformBars(id).map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full opacity-70"
          style={{ height: `${h}%`, background: glow }}
        />
      ))}
    </div>
  );
}

/**
 * The AI facet made visible: topics, key moments and action items the
 * enrichment pipeline distilled from this memory. Renders nothing until the
 * backend has populated `item.ai` (summary + mood surface elsewhere: the header
 * subtitle and the mood glow). Reuses existing tokens — no new design language.
 */
function AIInsights({ item }: { item: KnowledgeItem }) {
  const topics = item.ai?.topics ?? [];
  const keyMoments = item.ai?.keyMoments ?? [];
  const actionItems = item.ai?.actionItems ?? [];

  if (topics.length === 0 && keyMoments.length === 0 && actionItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {topics.length > 0 && (
        <div>
          <SectionLabel>Topics</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-white/[0.06]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {keyMoments.length > 0 && (
        <div>
          <SectionLabel>Key moments</SectionLabel>
          <ul className="space-y-2">
            {keyMoments.map((moment, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground/85"
              >
                <Sparkles
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
                <span>{moment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionItems.length > 0 && (
        <div>
          <SectionLabel>Action items</SectionLabel>
          <ul className="space-y-2">
            {actionItems.map((action, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground/85"
              >
                <ListChecks
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ExtractedContent({ item }: { item: KnowledgeItem }) {
  const text = item.content ?? item.excerpt;
  return (
    <section>
      <SectionLabel>Extracted content</SectionLabel>
      {text ? (
        <p className="font-editorial whitespace-pre-wrap break-words text-base leading-relaxed text-foreground/90">
          {text}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No extracted text yet — it appears here once processing finishes.
        </p>
      )}
    </section>
  );
}

function RelatedMemories({ related }: { related: KnowledgeItem[] }) {
  return (
    <section>
      <SectionLabel>Related memories</SectionLabel>
      {related.length > 0 ? (
        <div className="columns-1 gap-5 sm:columns-2">
          {related.map((item) => (
            <div key={item.id} className="mb-5 break-inside-avoid">
              <KnowledgeCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing closely related yet. Connections grow as you add more memories.
        </p>
      )}
    </section>
  );
}

function CitationsPlaceholder() {
  return (
    <section>
      <SectionLabel>Citations</SectionLabel>
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
        <Quote className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
        <p>
          When AI Chat answers using this memory, the passages it cited will appear
          here — with page and confidence.
        </p>
      </div>
    </section>
  );
}

function ProcessingPanel({ item }: { item: KnowledgeItem }) {
  const status = getProcessingStatus(item.pipeline);
  const failed = item.pipeline.stage === "failed";

  return (
    <Panel title="Processing status">
      <div className="flex items-center justify-between gap-2">
        <KnowledgeStatusBadge pipeline={item.pipeline} />
        <span className="text-xs text-muted-foreground/60">
          {Math.round(item.pipeline.progress * 100)}%
        </span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full", failed ? "bg-destructive" : "bg-aurora")}
          style={{ width: `${Math.round(item.pipeline.progress * 100)}%` }}
        />
      </div>

      {status !== "ready" && (
        <ol className="mt-4 space-y-1.5">
          {PIPELINE_STAGE_SEQUENCE.map((stage) => {
            const meta = PIPELINE_STAGE_META[stage];
            const state = stageStatusOf(item, stage);
            const Icon = meta.icon;
            return (
              <li
                key={stage}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  state === "pending" && "opacity-40",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    state === "done" && "text-success",
                    state === "active" && "text-foreground",
                    state === "failed" && "text-destructive",
                    state === "pending" && "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <span>{meta.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {failed && item.pipeline.error && (
        <p className="mt-3 text-xs text-destructive">{item.pipeline.error}</p>
      )}
    </Panel>
  );
}

function stageStatusOf(item: KnowledgeItem, stage: PipelineStage) {
  return item.pipeline.stages.find((s) => s.stage === stage)?.status ?? "pending";
}

function DetailsPanel({ item }: { item: KnowledgeItem }) {
  const typeLabel = KNOWLEDGE_TYPE_META[item.type].label;

  return (
    <Panel title="Details">
      <dl className="space-y-2.5 text-sm">
        <Row icon={<Tag className="size-3.5" />} label="Type" value={typeLabel} />
        <Row
          icon={<CalendarDays className="size-3.5" />}
          label="Created"
          value={formatDate(item.createdAt)}
        />
        <Row
          icon={<Clock className="size-3.5" />}
          label="Last accessed"
          value={
            item.lastAccessedAt ? formatRelativeDate(item.lastAccessedAt) : "—"
          }
        />
        {item.occurredAt && (
          <Row
            icon={<CalendarDays className="size-3.5" />}
            label="Occurred"
            value={formatDate(item.occurredAt)}
          />
        )}
        {item.people.length > 0 && (
          <Row
            icon={<Users className="size-3.5" />}
            label="People"
            value={item.people.map((p) => p.name).join(", ")}
          />
        )}
        {item.location && (
          <Row
            icon={<MapPin className="size-3.5" />}
            label="Location"
            value={item.location.name}
          />
        )}
      </dl>

      {item.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="max-w-full break-all rounded-full bg-white/[0.05] px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-muted-foreground/60">{icon}</span>
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-foreground/85">{value}</dd>
    </div>
  );
}

function MemoryIndexPanel({
  documentId,
  embeddingStatus,
  chunkCount,
  pageCount,
}: {
  documentId: string;
  embeddingStatus: string;
  chunkCount: number;
  pageCount?: number;
}) {
  return (
    <Panel title="Memory index">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <Boxes className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
        <span className="text-muted-foreground">{embeddingStatus}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Fact label="Chunks" value={String(chunkCount)} />
        <Fact label="Pages" value={pageCount ? String(pageCount) : "—"} />
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Document ID</dt>
          <dd className="mt-0.5 truncate font-mono text-xs text-foreground/70">
            {documentId}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-editorial text-xl">{value}</dd>
    </div>
  );
}
