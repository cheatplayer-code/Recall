"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { primaryNav, secondaryNav } from "@/config/navigation";
import { useUIStore } from "@/store";

import { Logo } from "./logo";
import { NavLink } from "./nav-link";

/**
 * Mobile slide-over navigation. Driven by `useUIStore.mobileNavOpen`; closes on
 * overlay tap or after navigating. Desktop uses the persistent Sidebar instead.
 */
export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            role="dialog"
            aria-label="Navigation"
          >
            <div className="flex h-14 items-center justify-between px-4">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={close}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
              {primaryNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={close} />
              ))}
            </nav>

            <div className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-2">
              {secondaryNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={close} />
              ))}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
