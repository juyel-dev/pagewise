import { BarChart3, Bookmark, BookOpen, Home, Settings, Target, type LucideIcon } from "lucide-react";

/**
 * Nav registry (arch spec §6): features register here once; the shell renders it.
 * Guests see every study surface; only Settings needs an account (decision 38).
 */
export type NavItem = { href: string; label: string; icon: LucideIcon; auth: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home, auth: false },
  { href: "/study", label: "Study", icon: BookOpen, auth: false },
  { href: "/practice", label: "Practice", icon: Target, auth: false },
  { href: "/progress", label: "Progress", icon: BarChart3, auth: false },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark, auth: false },
  { href: "/settings", label: "Settings", icon: Settings, auth: true },
];
