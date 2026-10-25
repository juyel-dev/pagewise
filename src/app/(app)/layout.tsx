import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AppNav } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/config/brand";
import { AppGate } from "./gate";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2 text-ink"><LogoMark className="size-7" /><span className="font-semibold">{brand.name}</span></Link>
          <AppNav />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Suspense fallback={<div className="h-9 w-24 animate-pulse rounded-full bg-surface-2" />}><UserMenu /></Suspense>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Suspense fallback={<div className="space-y-4"><div className="h-8 w-48 animate-pulse rounded bg-surface-2" /><div className="h-40 animate-pulse rounded-2xl bg-surface-2" /></div>}>
          <AppGate>{children}</AppGate>
        </Suspense>
      </main>
    </div>
  );
}
