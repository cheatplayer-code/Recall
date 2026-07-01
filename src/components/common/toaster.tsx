"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useToastStore, type ToastVariant } from "@/store/toast.store";

const ICON = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
} as const;

const RING: Record<ToastVariant, string> = {
  error: "ring-destructive/25",
  success: "ring-success/25",
  info: "ring-white/10",
};

const TONE: Record<ToastVariant, string> = {
  error: "text-destructive",
  success: "text-success",
  info: "text-muted-foreground",
};

/**
 * Renders the app-wide notification queue (bottom-right). Calm, dark, dismissible,
 * with an optional action (e.g. "Retry"). Mounted once by the providers.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
      {toasts.map((t) => {
        const Icon = ICON[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-popover p-3.5 shadow-glow ring-1",
              RING[t.variant],
            )}
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", TONE[t.variant])} aria-hidden="true" />
            <p className="min-w-0 flex-1 break-words text-sm text-foreground/90">
              {t.message}
            </p>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
