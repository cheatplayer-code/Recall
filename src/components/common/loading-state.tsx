import { cn } from "@/lib/utils";

/** Calm "thinking" state — a breathing aurora orb instead of a spinner. */
export function LoadingState({
  label = "Remembering…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="bg-aurora animate-breathe size-8 rounded-full blur-[1px]"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
