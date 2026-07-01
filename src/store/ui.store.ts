import { create } from "zustand";

/**
 * Client-only UI state for the app shell. This is NOT server data — server data
 * lives in React Query. Keep this store limited to ephemeral interface state.
 */
interface UIState {
  /** Desktop sidebar collapsed to icon-only rail. */
  sidebarCollapsed: boolean;
  /** Mobile slide-over navigation open. */
  mobileNavOpen: boolean;
  /** Command palette (⌘K) open. */
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandPaletteOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
