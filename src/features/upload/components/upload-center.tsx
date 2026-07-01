"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { UPLOAD_SOURCE_MAP, type UploadSourceId } from "../constants";
import { buildCreateInput } from "../lib/build-input";
import { useCreateKnowledge } from "../hooks/use-create-knowledge";
import { SourcePicker } from "./source-picker";
import { FileDropzone } from "./file-dropzone";

/** Body of the Upload Center: pick a source, provide content, add to Knowledge. */
export function UploadCenter({ onDone }: { onDone: () => void }) {
  const createKnowledge = useCreateKnowledge();

  const [sourceId, setSourceId] = useState<UploadSourceId>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [textValue, setTextValue] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  const source = UPLOAD_SOURCE_MAP[sourceId];

  function changeSource(id: UploadSourceId) {
    setSourceId(id);
    setFile(null);
    setTextValue("");
  }

  const hasContent =
    source.inputKind === "file" ? file !== null : textValue.trim().length > 0;

  function handleSubmit() {
    if (!hasContent) return;
    const input = buildCreateInput(source, { file, text: textValue, title, tags });
    createKnowledge.mutate(input);
    onDone();
  }

  return (
    <div className="flex flex-col gap-5">
      <SourcePicker value={sourceId} onChange={changeSource} />

      {/* Source-specific content input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        {source.inputKind === "file" && (
          <FileDropzone
            accept={source.accept}
            file={file}
            onFileChange={setFile}
            hint={source.hint}
          />
        )}
        {source.inputKind === "url" && (
          <Input
            type="url"
            value={textValue}
            placeholder={source.placeholder}
            onChange={(e) => setTextValue(e.target.value)}
          />
        )}
        {source.inputKind === "text" && (
          <Textarea
            value={textValue}
            placeholder={source.placeholder}
            onChange={(e) => setTextValue(e.target.value)}
            className="min-h-32"
          />
        )}
        {source.inputKind !== "file" && (
          <p className="text-xs text-muted-foreground">{source.hint}</p>
        )}
      </div>

      {/* Optional metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="upload-title" className="text-sm font-medium">
            Title <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="upload-title"
            value={title}
            placeholder="Auto-generated if empty"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="upload-tags" className="text-sm font-medium">
            Tags <span className="text-muted-foreground">(comma-separated)</span>
          </label>
          <Input
            id="upload-tags"
            value={tags}
            placeholder="ideas, work, reading"
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="hidden text-xs text-muted-foreground sm:block">
          AI will process it automatically after upload.
        </p>
        <Button size="lg" onClick={handleSubmit} disabled={!hasContent}>
          <Sparkles className="size-4" />
          Add to Knowledge
        </Button>
      </div>
    </div>
  );
}
