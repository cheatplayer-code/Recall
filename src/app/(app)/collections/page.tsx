import type { Metadata } from "next";

import { CollectionsScreen } from "@/features/collections";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return <CollectionsScreen />;
}
