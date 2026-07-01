import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Consistent content width and padding for every screen inside the shell. */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8", className)}>
      {children}
    </div>
  );
}
