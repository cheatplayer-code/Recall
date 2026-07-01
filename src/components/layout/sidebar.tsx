"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/ui/aurora";
import { primaryNav, secondaryNav } from "@/config/navigation";
import { useUIStore } from "@/store";

import { Logo } from "./logo";
import { NavLink } from "./nav-link";

/**
 * Desktop sidebar — an atmospheric rail. A faint aurora glows behind the
 * wordmark (ambient AI presence). Collapsible to an icon-only rail; hidden on
 * mobile. Renders entirely from the navigation config.
 */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "relative hidden h-svh shrink-0 flex-col bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <Aurora className="h-40 opacity-70" />

      <div
        className={cn(
          "relative flex h-16 items-center px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      <nav
        className="relative flex flex-1 flex-col gap-0.5 px-3 py-2"
        aria-label="Primary"
      >
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="relative flex flex-col gap-0.5 px-3 py-3">
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "mt-1 text-sidebar-foreground/60",
            !collapsed && "justify-start gap-3 px-3",
          )}
        >
          {collapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
