"use client";

import { cn } from "@/lib/utils";
import { UPLOAD_SOURCES, type UploadSourceId } from "../constants";

/** Grid of selectable source types (PDF, URL, YouTube, …). */
export function SourcePicker({
  value,
  onChange,
}: {
  value: UploadSourceId;
  onChange: (id: UploadSourceId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {UPLOAD_SOURCES.map((source) => {
        const Icon = source.icon;
        const active = source.id === value;
        return (
          <button
            key={source.id}
            type="button"
            onClick={() => onChange(source.id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {source.label}
          </button>
        );
      })}
    </div>
  );
}
