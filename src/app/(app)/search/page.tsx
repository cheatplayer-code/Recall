import type { Metadata } from "next";

import { SearchScreen } from "@/features/search";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <SearchScreen />;
}
