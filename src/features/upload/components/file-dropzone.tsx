"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  hint?: string;
}

/** Accessible drag-and-drop + click file picker for a single file. */
export function FileDropzone({
  accept,
  file,
  onFileChange,
  hint,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileCheck2 className="size-5 shrink-0 text-success" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onFileChange(null)}
          aria-label="Remove file"
          className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
        dragOver
          ? "border-primary bg-accent/50"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      <UploadCloud className="size-7 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">
        Drag &amp; drop or <span className="text-primary">browse</span>
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
