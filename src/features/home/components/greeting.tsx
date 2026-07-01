"use client";

import { useSyncExternalStore } from "react";

import { firstName } from "@/lib/knowledge-select";

function partOfDay(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const noopSubscribe = () => () => {};

/**
 * A warm, time-aware greeting. The salutation depends on the client's local
 * hour, so we read it via `useSyncExternalStore`: the server snapshot is a
 * neutral greeting and the client snapshot resolves the real time-of-day — no
 * hydration mismatch, no effect.
 */
export function Greeting({
  name,
  total,
}: {
  name: string | undefined;
  total: number;
}) {
  const salutation = useSyncExternalStore(
    noopSubscribe,
    () => partOfDay(new Date().getHours()),
    () => "Welcome back",
  );

  const summary =
    total === 0
      ? "Your memory is quiet — capture your first thought below."
      : `You've remembered ${total} ${total === 1 ? "thing" : "things"} so far.`;

  return (
    <div className="space-y-1.5">
      <h1 className="font-editorial text-[2rem] font-normal leading-tight tracking-tight">
        {salutation}, {firstName(name)}.
      </h1>
      <p className="text-sm text-muted-foreground">{summary}</p>
    </div>
  );
}
