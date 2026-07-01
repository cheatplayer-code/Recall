import { memo, type ReactNode } from "react";

import { CodeBlock } from "./code-block";

/**
 * A small, dependency-free Markdown renderer scoped to what chat answers use:
 * headings, bold/italic, inline + fenced code, links, blockquotes and lists.
 * It tolerates partial input (e.g. an unclosed code fence mid-stream), so it
 * renders cleanly while tokens are still arriving.
 *
 * Isolated by design — replacing it with `react-markdown` + a richer pipeline
 * later is a single-file swap; nothing else in chat imports a Markdown lib.
 */

/** Render inline spans: `code`, **bold**, *italic*, [text](url). */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /`([^`]+)`|\*\*([^*]+?)\*\*|\*([^*]+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, code, bold, italic, linkText, href] = m;
    if (code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {code}
        </code>,
      );
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {bold}
        </strong>,
      );
    } else if (italic !== undefined) {
      nodes.push(
        <em key={key++} className="italic">
          {italic}
        </em>,
      );
    } else if (linkText !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {linkText}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "code"; language?: string; code: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "quote"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code (tolerant of an unterminated closing fence while streaming).
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1];
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence if present
      blocks.push({ kind: "code", language, code: body.join("\n") });
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ kind: "quote", lines: quote });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph: gather consecutive non-blank, non-special lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }

  return blocks;
}

const HEADING_CLASS: Record<number, string> = {
  1: "font-editorial text-xl leading-snug mt-4 mb-2",
  2: "font-editorial text-lg leading-snug mt-4 mb-2",
  3: "font-medium text-base mt-3 mb-1.5",
  4: "font-medium text-sm mt-3 mb-1.5",
};

export const Markdown = memo(function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, idx) => {
        switch (block.kind) {
          case "code":
            return (
              <CodeBlock key={idx} code={block.code} language={block.language} />
            );
          case "heading":
            return (
              <p key={idx} className={HEADING_CLASS[block.level]}>
                {renderInline(block.text)}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={idx}
                className="my-3 border-l-2 border-white/15 pl-3 text-muted-foreground italic"
              >
                {renderInline(block.lines.join(" "))}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={idx} className="my-2 list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="my-2 list-decimal space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={idx} className="my-2 first:mt-0 last:mb-0">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
});
