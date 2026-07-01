"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NEAR_BOTTOM_PX = 80;

/**
 * Keeps a scroll container pinned to the bottom as content grows (new messages,
 * streamed tokens) — but only while the user is already near the bottom. If they
 * scroll up to read history, auto-scroll yields until they return.
 *
 * `dep` should change whenever content height may have changed (e.g. message
 * count + the streaming message's length).
 */
export function useAutoScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  const [stuck, setStuck] = useState(true);
  const stuckRef = useRef(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const next = distance <= NEAR_BOTTOM_PX;
    stuckRef.current = next;
    setStuck(next);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight });
  }, []);

  useEffect(() => {
    if (stuckRef.current) {
      const el = ref.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [dep]);

  return { ref, onScroll, stuck, scrollToBottom };
}
