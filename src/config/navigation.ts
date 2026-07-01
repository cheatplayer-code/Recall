import {
  Home,
  Search,
  LayoutGrid,
  FolderOpen,
  Brain,
  UploadCloud,
  MessageSquare,
  Clock,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for the app's primary navigation. Add a new section
 * by appending one entry here — the sidebar and mobile nav render from this.
 */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Workspaces", href: "/workspaces", icon: LayoutGrid },
  { label: "Collections", href: "/collections", icon: FolderOpen },
  { label: "Knowledge", href: "/knowledge", icon: Brain },
  { label: "Upload", href: "/upload", icon: UploadCloud },
  { label: "AI Chat", href: "/chat", icon: MessageSquare },
  { label: "Recent", href: "/recent", icon: Clock },
];

/** Items pinned to the bottom of the sidebar. */
export const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];
