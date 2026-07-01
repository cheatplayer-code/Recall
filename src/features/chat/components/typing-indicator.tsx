/** Three drifting dots shown while the assistant is retrieving / starting to generate. */
export function TypingIndicator() {
  return (
    <span
      className="inline-flex items-center gap-1"
      role="status"
      aria-label="Assistant is thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 160}ms`, animationDuration: "1s" }}
        />
      ))}
    </span>
  );
}
