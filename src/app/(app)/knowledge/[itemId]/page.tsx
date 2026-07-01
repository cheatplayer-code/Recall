"use client";

import { useParams } from "next/navigation";

import { MemoryDetail } from "@/features/knowledge";

export default function KnowledgeItemPage() {
  const params = useParams<{ itemId: string }>();
  return <MemoryDetail itemId={params.itemId} />;
}
