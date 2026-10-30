"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [{ href: "/home", label: "Home" }, { href: "/study", label: "Study" }, { href: "/settings", label: "Settings" }];

export function AppNav({ guest = false }: { guest?: boolean }) {
  const path = usePathname();
  const shown = guest ? links.filter((l) => l.href !== "/settings") : links;
  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {shown.map((l) => {
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
