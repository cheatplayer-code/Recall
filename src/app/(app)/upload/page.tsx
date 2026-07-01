import type { Metadata } from "next";

import { UploadScreen } from "@/features/upload";

export const metadata: Metadata = { title: "Upload" };

export default function UploadPage() {
  return <UploadScreen />;
}
