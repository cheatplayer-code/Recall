"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingState } from "@/components/common";
import { useAuthStore } from "@/store";

/**
 * Gate for the authenticated app. While the session is resolving it shows a calm
 * loader; once known unauthenticated it redirects to /login (remembering where
 * the user was trying to go). Only renders the app once authenticated — so no
 * protected screen ever flashes for a signed-out visitor.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === "authenticated") return <>{children}</>;

  return (
    <div className="grid min-h-svh place-items-center">
      <LoadingState label="Preparing your memory…" />
    </div>
  );
}
