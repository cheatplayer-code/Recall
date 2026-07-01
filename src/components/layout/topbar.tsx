"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { WorkspaceSwitcher } from "./workspace-switcher";

function initial(name: string | undefined): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "·";
}

/**
 * Top bar of the app shell — quiet and atmospheric. A mobile menu trigger, a
 * calm entry point into search, and the user mark. Section actions live on each
 * screen, not here.
 */
export function Topbar() {
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-background/70 px-4 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <WorkspaceSwitcher />

      <Link
        href="/search"
        className="flex h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-full bg-muted/40 px-4 text-sm text-muted-foreground ring-1 ring-white/5 transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Ask your memory anything…</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/settings"
          aria-label="Settings"
          title={user?.name ?? "Settings"}
          className="grid size-8 place-items-center rounded-full bg-accent text-sm font-medium text-accent-foreground ring-1 ring-white/10 transition-opacity hover:opacity-80"
        >
          {initial(user?.name)}
        </Link>
      </div>
    </header>
  );
}
