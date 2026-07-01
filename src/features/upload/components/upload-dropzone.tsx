"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

import { ACCEPTED_FILE_TYPES } from "../lib/file-type";

/** Premium, calm multi-file drag & drop. Presentational — emits the files. */
export function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function emit(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    emit(e.dataTransfer.files);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files"
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
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl px-6 py-16 text-center ring-1 transition-colors duration-200",
        dragOver
          ? "bg-accent/40 ring-primary"
          : "bg-card/40 ring-white/5 hover:bg-card/60",
      )}
    >
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-white/5">
        <UploadCloud className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="font-editorial text-lg">Drop files to remember</p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, images, audio or text — or{" "}
          <span className="text-primary">browse</span>
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => {
          emit(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
