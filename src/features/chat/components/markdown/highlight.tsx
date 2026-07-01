import { Fragment, type ReactNode } from "react";

/**
 * A deliberately small, synchronous syntax highlighter. It tokenizes common
 * code constructs (comments, strings, numbers, keywords, function calls) into
 * styled spans — enough to read well in a chat answer, with zero dependencies
 * and no async theme loading, so it stays smooth while a code block streams in.
 *
 * Isolated on purpose: swapping in Shiki / Prism later means replacing only
 * this function — `CodeBlock` and the markdown renderer are untouched.
 */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "class", "extends",
  "import", "export", "from", "default", "async", "await", "try", "catch",
  "finally", "throw", "typeof", "instanceof", "in", "of", "this", "super",
  "void", "yield", "true", "false", "null", "undefined", "interface", "type",
  "enum", "public", "private", "protected", "readonly", "static", "as", "def",
  "elif", "lambda", "None", "True", "False", "and", "or", "not", "with",
]);

// Order matters: earlier patterns win at a given position.
const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*)|(\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g;

export function highlightCode(code: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={key++}>{code.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    const [, lineComment, blockComment, str, num, fnName, ident] = match;

    if (lineComment || blockComment) {
      nodes.push(
        <span key={key++} className="text-muted-foreground/70 italic">
          {match[0]}
        </span>,
      );
    } else if (str) {
      nodes.push(
        <span key={key++} className="text-success">
          {str}
        </span>,
      );
    } else if (num) {
      nodes.push(
        <span key={key++} className="text-accent-foreground">
          {num}
        </span>,
      );
    } else if (fnName) {
      nodes.push(
        <span key={key++} className="text-foreground">
          {fnName}
        </span>,
      );
    } else if (ident) {
      nodes.push(
        KEYWORDS.has(ident) ? (
          <span key={key++} className="font-medium text-primary">
            {ident}
          </span>
        ) : (
          <Fragment key={key++}>{ident}</Fragment>
        ),
      );
    }
    lastIndex = TOKEN_RE.lastIndex;
  }

  if (lastIndex < code.length) {
    nodes.push(<Fragment key={key++}>{code.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}
