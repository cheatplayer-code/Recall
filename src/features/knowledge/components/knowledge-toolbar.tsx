"use client";

import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/common";
import type { KnowledgeType } from "@/types";

import { KNOWLEDGE_TYPE_META, KNOWLEDGE_TYPE_ORDER } from "../constants";

export type TypeFilter = KnowledgeType | "all";

export interface KnowledgeToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeType: TypeFilter;
  onTypeChange: (type: TypeFilter) => void;
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
}

/**
 * Quiet controls for the Memory Feed. No sort — the feed is always
 * chronological, grouped by time. Search and a soft type filter recede until
 * the user reaches for them.
 */
export function KnowledgeToolbar({
  search,
  onSearchChange,
  activeType,
  onTypeChange,
  favoritesOnly,
  onFavoritesToggle,
}: KnowledgeToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search within your memories…"
          aria-label="Search within your memories"
          className="flex-1"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={onFavoritesToggle}
          aria-pressed={favoritesOnly}
          aria-label="Show favorites only"
          className="rounded-full"
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              favoritesOnly
                ? "fill-current text-mood-positive"
                : "text-muted-foreground",
            )}
          />
        </Button>
      </div>

      {/* Soft type filter — quiet text, recedes until reached for */}
      <div className="-mx-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        <TypeChip active={activeType === "all"} onClick={() => onTypeChange("all")}>
          All
        </TypeChip>
        {KNOWLEDGE_TYPE_ORDER.map((type) => (
          <TypeChip
            key={type}
            active={activeType === type}
            onClick={() => onTypeChange(type)}
          >
            {KNOWLEDGE_TYPE_META[type].label}
          </TypeChip>
        ))}
      </div>
    </div>
  );
}

function TypeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "text-sm transition-colors",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
