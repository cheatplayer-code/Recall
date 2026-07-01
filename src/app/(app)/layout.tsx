import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { RequireAuth } from "@/features/auth";

/**
 * Layout for the authenticated application. Every screen in the `(app)` group is
 * gated by {@link RequireAuth} and renders inside the shared App Shell
 * (sidebar + top bar).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
