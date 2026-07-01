/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";

import type { CollectionView } from "../lib/derive";
import { CollectionMenu } from "./collection-menu";

/** The cover: a mosaic of member thumbnails, or a calm gradient when none exist. */
function Cover({ urls }: { urls: string[] }) {
  if (urls.length === 0) {
    return (
      <div className="relative grid h-32 place-items-center overflow-hidden rounded-t-xl bg-gradient-to-br from-accent/40 to-card">
        <div className="bg-aurora animate-aurora absolute inset-0 opacity-[0.12]" />
        <FolderOpen className="relative size-7 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid h-32 gap-0.5 overflow-hidden rounded-t-xl",
        urls.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {urls.slice(0, 4).map((url, i) => (
        <img
          key={`${url}-${i}`}
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            "size-full object-cover",
            urls.length === 3 && i === 0 && "row-span-2",
          )}
        />
      ))}
    </div>
  );
}

/** A collection as a card: cover mosaic, name, item count and last-updated time. */
export function CollectionCard({ collection }: { collection: CollectionView }) {
  return (
    <div className="group relative">
      <Link
        href={`/collections/${collection.id}`}
        className="block overflow-hidden rounded-xl bg-card/60 ring-1 ring-white/[0.06] transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Cover urls={collection.coverImageUrls} />
        <div className="p-4">
          <h3 className="font-editorial truncate text-base leading-snug">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {collection.description}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground/70">
            {collection.itemCount}{" "}
            {collection.itemCount === 1 ? "memory" : "memories"} ·{" "}
            {formatRelativeDate(collection.lastUpdatedAt)}
          </p>
        </div>
      </Link>
      <CollectionMenu
        collection={collection}
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[open=true]:opacity-100"
      />
    </div>
  );
}
