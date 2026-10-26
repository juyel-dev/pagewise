import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppGate } from "@/components/app/gate";
import { brand } from "@/config/brand";

export default function StudyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex h-14 items-center gap-3 border-b border-line bg-surface px-4">
        <Link href="/home" className="flex items-center gap-2 text-ink"><LogoMark className="size-7" /><span className="font-semibold">{brand.name}</span></Link>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>
      <main id="main">
        <Suspense fallback={<div className="p-6"><div className="h-8 w-48 animate-pulse rounded bg-surface-2" /></div>}>
          <AppGate>{children}</AppGate>
        </Suspense>
      </main>
    </div>
  );
}
