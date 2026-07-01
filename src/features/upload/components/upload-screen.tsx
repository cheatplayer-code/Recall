"use client";

import Link from "next/link";
import { FileStack } from "lucide-react";

import { PageContainer, PageHeader, EmptyState } from "@/components/common";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/store";

import { useUpload } from "../hooks/use-upload";
import { UploadDropzone } from "./upload-dropzone";
import { PipelineStepper } from "./pipeline-stepper";

/** The Upload experience: drop files, watch them move through the RAG pipeline. */
export function UploadScreen() {
  const { upload } = useUpload();
  const uploads = useUploadStore((s) => s.uploads);

  return (
    <PageContainer>
      <PageHeader
        title="Add to your memory"
        description="Drop a file and watch Recall make sense of it."
        actions={
          uploads.length > 0 ? (
            <Link
              href="/knowledge"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View in Knowledge →
            </Link>
          ) : undefined
        }
      />

      <div className="mt-8 space-y-8">
        <UploadDropzone onFiles={upload} />

        {uploads.length > 0 ? (
          <div className="space-y-4">
            {uploads.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="min-w-0">
                  <h3 className="font-editorial truncate text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/55">
                    {item.type}
                  </p>
                </div>
                <div className="mt-4">
                  <PipelineStepper pipeline={item.pipeline} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileStack}
            title="Nothing uploading yet"
            description="Your files appear here as they move through processing, and land in Knowledge when ready."
          />
        )}
      </div>
    </PageContainer>
  );
}
