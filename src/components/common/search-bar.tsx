"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible label; falls back to the placeholder. */
  "aria-label"?: string;
  autoFocus?: boolean;
  className?: string;
  /** Larger field for the dedicated Search screen. */
  size?: "default" | "lg";
}

/**
 * The shared search field used across the app (Knowledge toolbar, Search screen,
 * pickers). Icon, clear button and rounded styling live here once so every search
 * box looks and behaves the same.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  autoFocus,
  className,
  size = "default",
  ...rest
}: SearchBarProps) {
  const label = rest["aria-label"] ?? placeholder;
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "size-5" : "size-4",
        )}
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        className={cn(
          "rounded-full pl-10 pr-9",
          size === "lg" && "h-12 pl-11 text-base",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
        >
          <X className={size === "lg" ? "size-5" : "size-4"} />
        </button>
      )}
    </div>
  );
}
