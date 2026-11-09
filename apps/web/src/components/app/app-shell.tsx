"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { OfflinePill } from "@/components/app/offline-pill";
import { buttonClasses } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { brand } from "@/config/brand";
import { NAV_ITEMS, type NavItem } from "@/config/nav";
import { cn } from "@/lib/cn";

type Props = {
  guest: boolean;
  /** Signed-in user card in the sidebar. */
  user?: { name: string; cls: "11" | "12" | "dropper" | null; year: number | null };
  /** Top-bar right cluster (theme toggle, account menu). */
  right?: ReactNode;
  /** Force the tab bar on or off. By default it is hidden on workspace routes only. */
  hideTabBar?: boolean;
  children?: ReactNode;
};

export const isActive = (path: string, href: string) => path === href || path.startsWith(href + "/");

/** Workspace routes (`/study/<chapter>`, `/review/<chapter>`) have their own bottom action bar, so the tab bar is hidden there. The hub `/study` keeps it. */
export const isWorkspacePath = (path: string) => /^\/(study|review)\/[^/]+/.test(path);

/**
 * App shell (docs/walkthrough/00-tour.md §2.2): light sidebar from `lg`, bottom tab bar below.
 * Guests see every study surface; only Settings needs an account (decision 38).
 */
export function AppShell({ guest, user, right, hideTabBar, children }: Props) {
  const t = useTranslations();
  const path = usePathname();
  const [more, setMore] = useState(false);
  const noTabBar = hideTabBar ?? isWorkspacePath(path);
  const items = NAV_ITEMS.filter((i) => !guest || !i.auth);
  const main = items.filter((i) => i.key !== "settings");
  const account = items.filter((i) => i.key === "settings");
  const tabItems = items.filter((i) => i.tab);
  const moreItems = items.filter((i) => !i.tab);
  const current = items.find((i) => isActive(path, i.href));
  const profileMeta = !user?.cls ? null
    : user.cls === "dropper" ? (user.year ? t("shell.metaDropper", { year: user.year }) : t("shell.metaDropperOnly"))
    : user.year ? t("shell.metaClass", { cls: user.cls, year: user.year }) : t("shell.metaClassOnly", { cls: user.cls });

  const link = (i: NavItem) => {
    const Icon = i.icon;
    const active = isActive(path, i.href);
    return (
      <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
        className={cn("relative flex h-10 items-center gap-3 rounded-lg px-3 text-label transition-colors",
          active ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}>
        {active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-brand" /> : null}
        <Icon className="size-5 shrink-0" aria-hidden="true" focusable="false" />
        {t(`nav.${i.key}`)}
      </Link>
    );
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-line bg-surface lg:flex">
        <Link href="/home" aria-label={t("shell.homeLink")} className="flex h-14 shrink-0 items-center gap-2.5 px-4">
          <LogoMark className="size-7" />
          <span className="text-h3 text-ink">{brand.name}</span>
        </Link>
        <nav aria-label={t("shell.mainNav")} className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {main.map(link)}
          {account.length > 0 ? <div role="separator" className="my-2 h-px bg-line" /> : null}
          {account.map(link)}
        </nav>
        <div className="m-3 rounded-xl border border-line bg-surface-2/60 p-3">
          {guest ? (
            <>
              <p className="text-label text-ink">{t("shell.guestTitle")}</p>
              <p className="mt-1 text-small text-ink-2">{t("shell.guestBody")}</p>
              <Link href="/sign-in" className={cn(buttonClasses("primary", "sm"), "mt-3 w-full")}>{t("common.signIn")}</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-label text-white">{(user?.name ?? "?").slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate text-label text-ink">{user?.name}</p>
                {profileMeta ? <p className="truncate text-small text-ink-2">{profileMeta}</p> : null}
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-[232px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas px-4 sm:px-6">
          <Link href="/home" aria-label={t("shell.homeLink")} className="lg:hidden"><LogoMark className="size-7" /></Link>
          <p className="min-w-0 flex-1 truncate text-label text-ink lg:text-h2">{current ? t(`nav.${current.key}`) : ""}</p>
          <div className="flex items-center gap-2">{right}</div>
        </header>
        <OfflinePill />
        <div className={cn("flex min-h-0 flex-1 flex-col", !noTabBar && "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0")}>{children}</div>
      </div>

      {!noTabBar ? (
        <nav aria-label={t("shell.tabBar")} className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
          {tabItems.map((i) => {
            const Icon = i.icon;
            const active = isActive(path, i.href);
            return (
              <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}
                className={cn("relative flex flex-1 flex-col items-center justify-center gap-0.5 text-caption transition-colors", active ? "text-brand-text" : "text-ink-2")}>
                {active ? <span aria-hidden="true" className="absolute inset-x-4 top-0 h-[3px] rounded-b bg-brand" /> : null}
                <Icon className="size-6" aria-hidden="true" focusable="false" />
                {t(`nav.${i.key}`)}
              </Link>
            );
          })}
          <button type="button" onClick={() => setMore(true)} className="flex flex-1 flex-col items-center justify-center gap-0.5 text-caption text-ink-2">
            <MoreHorizontal className="size-6" aria-hidden="true" />
            {t("common.more")}
          </button>
        </nav>
      ) : null}

      <Sheet open={more} onClose={() => setMore(false)} title={t("shell.moreTitle")}>
        <ul className="flex flex-col gap-1">
          {moreItems.map((i) => {
            const Icon = i.icon;
            return (
              <li key={i.href}>
                <Link href={i.href} onClick={() => setMore(false)} className="flex min-h-12 items-center gap-3 rounded-lg px-2 text-body text-ink hover:bg-surface-2">
                  <Icon className="size-5 text-ink-2" aria-hidden="true" focusable="false" />{t(`nav.${i.key}`)}
                </Link>
              </li>
            );
          })}
          {guest ? (
            <li><Link href="/sign-in" onClick={() => setMore(false)} className="flex min-h-12 items-center rounded-lg px-2 text-body text-brand-text hover:bg-surface-2">{t("common.signIn")}</Link></li>
          ) : null}
          <li role="separator" className="my-2 h-px bg-line" />
          <li><Link href="/legal/terms" onClick={() => setMore(false)} className="flex min-h-11 items-center rounded-lg px-2 text-small text-ink-2 hover:bg-surface-2">{t("shell.terms")}</Link></li>
          <li><Link href="/legal/privacy" onClick={() => setMore(false)} className="flex min-h-11 items-center rounded-lg px-2 text-small text-ink-2 hover:bg-surface-2">{t("shell.privacy")}</Link></li>
        </ul>
      </Sheet>
    </>
  );
}
