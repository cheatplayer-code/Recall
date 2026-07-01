import type { Metadata } from "next";

import { RecentScreen } from "@/features/recent";

export const metadata: Metadata = { title: "Recent" };

export default function RecentPage() {
  return <RecentScreen />;
}
