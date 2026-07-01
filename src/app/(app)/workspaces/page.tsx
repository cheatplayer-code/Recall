import type { Metadata } from "next";

import { WorkspacesScreen } from "@/features/workspaces";

export const metadata: Metadata = { title: "Workspaces" };

export default function WorkspacesPage() {
  return <WorkspacesScreen />;
}
