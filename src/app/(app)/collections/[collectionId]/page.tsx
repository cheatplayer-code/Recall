"use client";

import { useParams } from "next/navigation";

import { CollectionDetail } from "@/features/collections";

export default function CollectionDetailPage() {
  const params = useParams<{ collectionId: string }>();
  return <CollectionDetail collectionId={params.collectionId} />;
}
