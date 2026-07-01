"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** A minimal expandable section used by the RAG panel. Collapsed by default. */
export function Disclosure({
  icon: Icon,
  label,
  count,
  defaultOpen = false,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
        <Icon className="size-3.5 shrink-0" />
        <span className="font-medium">{label}</span>
        {count !== undefined && (
          <span className="text-muted-foreground/50">{count}</span>
        )}
      </button>
      {open && <div className="px-3 pb-3 pt-0.5">{children}</div>}
    </div>
  );
}
