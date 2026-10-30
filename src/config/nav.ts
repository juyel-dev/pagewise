import { BarChart3, Bookmark, BookOpen, Home, Settings, Target, type LucideIcon } from "lucide-react";

/**
 * Nav registry (arch spec §6): features register here once; the shell renders it.
 * `auth` items are hidden from guests (decisions 28–32) — the RLS/proxy layer stays the real guard.
 */
export type NavItem = { href: string; label: string; icon: LucideIcon; auth: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home, auth: false },
  { href: "/study", label: "Study", icon: BookOpen, auth: false },
  { href: "/practice", label: "Practice", icon: Target, auth: true },
  { href: "/progress", label: "Progress", icon: BarChart3, auth: true },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark, auth: true },
  { href: "/settings", label: "Settings", icon: Settings, auth: true },
];
