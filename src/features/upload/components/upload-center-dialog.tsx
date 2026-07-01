"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { UploadCenter } from "./upload-center";

/**
 * "Capture" entry point. Opens the Upload Center in a dialog. The new item is
 * added to the Knowledge list optimistically, so the dialog can close
 * immediately while processing continues in the background.
 */
export function UploadCenterDialog({ label = "Capture" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {label}
      </Button>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add to Knowledge</DialogTitle>
          <DialogDescription>
            Capture a PDF, link, video, note, image or audio. AI processes it
            automatically.
          </DialogDescription>
        </DialogHeader>

        <UploadCenter onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
