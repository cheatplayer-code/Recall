import { cn } from "@/lib/utils";

/**
 * Ambient aurora — the AI made visible as light, never as a button or banner.
 * A soft, drifting gradient field used sparingly behind brand/AI surfaces.
 * Decorative only.
 */
export function Aurora({
  className,
  intensity = "soft",
}: {
  className?: string;
  intensity?: "soft" | "medium";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "bg-aurora animate-aurora absolute -inset-[40%] blur-3xl",
          intensity === "soft" ? "opacity-20" : "opacity-35",
        )}
      />
    </div>
  );
}
