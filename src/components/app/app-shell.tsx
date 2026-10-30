"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { brand } from "@/config/brand";
import { NAV_ITEMS } from "@/config/nav";
import { cn } from "@/lib/cn";

type Props = { guest: boolean; right?: ReactNode; children?: ReactNode };

/**
 * P1 shell: dark sidebar (mock frame 4) + slim top bar with the menu/avatar cluster.
 * The sidebar is an isolated `.dark` island — the app's dark tokens apply inside it in
 * every theme, so no new tokens are needed and the contrast matrix stays untouched.
 */
export function AppShell({ guest, right, children }: Props) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const items = NAV_ITEMS.filter((i) => !guest || !i.auth);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  const panel = (
    <div className="flex h-full flex-col bg-canvas text-ink">
      <Link href="/home" className="flex items-center gap-2 px-4 pt-4 pb-2" onClick={() => setOpen(false)}>
        <LogoMark className="size-7" />
        <span className="font-semibold text-ink">{brand.name}</span>
      </Link>
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={active(i.href) ? "page" : undefined}
              className={cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active(i.href) ? "bg-brand text-white" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}>
              <Icon className="size-[1.15rem] shrink-0" aria-hidden focusable="false" />
              {i.label}
            </Link>
          );
        })}
      </nav>
      {guest ? (
        <div className="mx-3 mb-3">
          <Link href="/sign-in?next=%2Fstudy" onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-hover">
            Sign in with Google
          </Link>
          <p className="mt-2 px-1 text-[11px] leading-4 text-muted">Guests can browse everything; signing in keeps your progress.</p>
        </div>
      ) : (
        <div className="mx-3 mb-3 rounded-2xl bg-surface-2/70 px-3 py-3">
          <p className="text-xs leading-5 text-ink-2">Small steps every day lead to big results.</p>
          <div aria-hidden className="mt-2 h-1 rounded-full bg-line"><div className="h-1 w-1/3 rounded-full bg-brand" /></div>
        </div>
      )}
      <p className="px-4 pb-4 text-[11px] text-muted">NCERT · NEET prep</p>
    </div>
  );

  return (
    <>
      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-surface/90 px-4 backdrop-blur md:hidden">
        <button type="button" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface-2"
          aria-expanded={open} aria-controls="app-drawer" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
        <Link href="/home" className="flex items-center gap-2 font-semibold text-ink"><LogoMark className="size-6" />{brand.name}</Link>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </header>
      {open && (
        <div id="app-drawer" className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close menu overlay" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 border-r border-line shadow-window dark">{panel}</aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line dark md:flex md:flex-col">{panel}</aside>
      {/* Content column */}
      <div className="flex min-h-dvh flex-col md:pl-60">
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-end gap-2 border-b border-line bg-canvas/80 px-4 backdrop-blur sm:px-6 md:flex">
          {right}
        </header>
        {children}
      </div>
    </>
  );
}
