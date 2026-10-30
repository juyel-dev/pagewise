import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AppNav } from "@/components/app/app-nav";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppGate } from "@/components/app/gate";
import { brand } from "@/config/brand";
import { getSession } from "@/lib/auth/session";

/** Reads the session inside Suspense so the shell can still prerender (PPR). */
async function AppNavHost() {
  const s = await getSession();
  return <AppNav guest={!s} />;
}

export default function StudyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2 text-ink"><LogoMark className="size-7" /><span className="font-semibold">{brand.name}</span></Link>
          <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-full bg-surface-2" />}><AppNavHost /></Suspense>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </header>
      <main id="main">
        <Suspense fallback={<div className="p-6"><div className="h-8 w-48 animate-pulse rounded bg-surface-2" /></div>}>
          <AppGate>{children}</AppGate>
        </Suspense>
      </main>
    </div>
  );
}
