"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [{ href: "/home", label: "Home" }, { href: "/library", label: "Library" }, { href: "/settings", label: "Settings" }];

export function AppNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {links.map((l) => {
        const active = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
            className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
