"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, LayoutGrid, Settings2 } from "lucide-react";

import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useWorkspaceStore } from "@/store";

/**
 * Switches the active workspace. The selection lives in `useWorkspaceStore`
 * (persisted) and scopes every list query (Knowledge, Collections, Search,
 * Recent, Home). Defaults to the first workspace once the list loads.
 */
export function WorkspaceSwitcher() {
  const { data: workspaces = [] } = useWorkspaces();
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActive = useWorkspaceStore((s) => s.setActiveWorkspace);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Resolve a sensible default: first workspace when none is selected or the
  // remembered one no longer exists. (Zustand setter — not React state.)
  useEffect(() => {
    if (workspaces.length === 0) return;
    const stillValid = activeId && workspaces.some((w) => w.id === activeId);
    if (!stillValid) setActive(workspaces[0].id);
  }, [workspaces, activeId, setActive]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];
  if (!active) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 max-w-[10rem] items-center gap-2 rounded-full bg-muted/40 px-3 text-sm ring-1 ring-white/5 transition-colors hover:bg-muted/60 sm:max-w-[14rem]"
      >
        <LayoutGrid className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">{active.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-11 z-40 w-60 overflow-hidden rounded-xl bg-popover p-1 shadow-glow ring-1 ring-white/10"
        >
          <p className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/50">
            Workspaces
          </p>
          <ul className="max-h-72 overflow-y-auto">
            {workspaces.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={w.id === active.id}
                  onClick={() => {
                    setActive(w.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate">{w.name}</span>
                  {w.id === active.id && (
                    <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="my-1 h-px bg-white/[0.08]" />
          <Link
            href="/workspaces"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings2 className="size-4" />
            Manage workspaces
          </Link>
        </div>
      )}
    </div>
  );
}
