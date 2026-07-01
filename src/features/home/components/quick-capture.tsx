"use client";

import Link from "next/link";
import { FileText, Image as ImageIcon, Link2, Mic } from "lucide-react";

import { UploadCenterDialog } from "@/features/upload";

const QUICK_SOURCES = [
  { label: "PDF", icon: FileText },
  { label: "Image", icon: ImageIcon },
  { label: "Link", icon: Link2 },
  { label: "Audio", icon: Mic },
] as const;

/**
 * The fastest way to add a memory from the dashboard. Opens the shared Upload
 * Center (same pipeline as everywhere else); the quiet source chips set the
 * expectation of what can be captured without duplicating upload logic.
 */
export function QuickCapture() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-card/50 p-6 ring-1 ring-white/[0.06]">
      <div className="bg-aurora animate-aurora pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h2 className="font-editorial text-xl tracking-tight">Quick capture</h2>
          <p className="text-sm text-muted-foreground">
            Drop in a PDF, image, link, note or recording — AI files it away for you.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_SOURCES.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="/upload"
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/5 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <UploadCenterDialog />
        </div>
      </div>
    </section>
  );
}
