import type { Metadata } from "next";

import { KnowledgeScreen } from "@/features/knowledge";

export const metadata: Metadata = { title: "Knowledge" };

export default function KnowledgePage() {
  return <KnowledgeScreen />;
}
