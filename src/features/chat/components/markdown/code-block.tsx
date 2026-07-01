"use client";

import { memo } from "react";

import { useCopy } from "../../hooks/use-copy";
import { highlightCode } from "./highlight";
import { CopyButton } from "../copy-button";

/**
 * A fenced code block: language label, copy action, and lightweight syntax
 * highlighting. Memoized so re-rendering the surrounding message (e.g. as later
 * tokens stream in) doesn't re-highlight finished code.
 */
export const CodeBlock = memo(function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const { copied, copy } = useCopy();

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground/60">
          {language || "code"}
        </span>
        <CopyButton copied={copied} onCopy={() => copy(code)} />
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-[0.8rem] leading-relaxed">
        <code className="font-mono">{highlightCode(code)}</code>
      </pre>
    </div>
  );
});
