import type { Metadata } from "next";
import { Suspense } from "react";

import { ChatScreen, ChatHandoff } from "@/features/chat";

export const metadata: Metadata = { title: "AI Chat" };

export default function ChatPage() {
  return (
    <>
      {/* Consumes the ?memory= deep link; needs Suspense for useSearchParams. */}
      <Suspense fallback={null}>
        <ChatHandoff />
      </Suspense>
      <ChatScreen />
    </>
  );
}
