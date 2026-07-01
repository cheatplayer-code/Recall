"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Copy text to the clipboard and flag `copied` briefly for UI feedback. */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      } catch {
        setCopied(false);
      }
    },
    [resetMs],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { copied, copy };
}
