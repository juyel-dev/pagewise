import { BarChart3, Bookmark, BookOpen, Home, Settings, Target, type LucideIcon } from "lucide-react";

/**
 * Nav registry (arch spec §6): features register here once; the shell renders it.
 * Guests see every study surface; only Settings needs an account (decision 38).
 */
/** `key` is a message key under `nav.*` in messages/en.json. `tab`: shown in the phone tab bar (the rest go under “More”). */
export type NavItem = { href: string; key: "home" | "study" | "practice" | "progress" | "bookmarks" | "settings"; icon: LucideIcon; auth: boolean; tab: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", key: "home", icon: Home, auth: false, tab: true },
  { href: "/study", key: "study", icon: BookOpen, auth: false, tab: true },
  { href: "/practice", key: "practice", icon: Target, auth: false, tab: true },
  { href: "/progress", key: "progress", icon: BarChart3, auth: false, tab: true },
  { href: "/bookmarks", key: "bookmarks", icon: Bookmark, auth: false, tab: false },
  { href: "/settings", key: "settings", icon: Settings, auth: true, tab: false },
];
