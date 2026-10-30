import type { ReactNode } from "react";
import { AppGate } from "@/components/app/gate";
import { AppShell } from "@/components/app/app-shell";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth/session";

/**
 * Session-aware shell body. Resolves the session inside the caller's Suspense boundary
 * so the shell markup can still prerender (PPR) and only the dynamic bits stream in.
 */
export default async function ShellBody({ children, mainClassName }: { children: ReactNode; mainClassName?: string }) {
  const s = await getSession();
  return (
    <AppShell guest={!s} right={<><ThemeToggle /><UserMenu /></>}>
      <main id="main" className={mainClassName}>
        <AppGate>{children}</AppGate>
      </main>
    </AppShell>
  );
}

export function ShellFallback() {
  return (
    <div className="min-h-dvh bg-canvas" aria-hidden>
      <div className="fixed hidden h-14 w-60 border-r border-line bg-surface md:block" />
      <div className="md:pl-60">
        <div className="h-14 border-b border-line" />
        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-2" />
          <div className="h-40 w-full animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
