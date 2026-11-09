import type { ReactNode } from "react";
import { AppGate } from "@/components/app/gate";
import { AppShell } from "@/components/app/app-shell";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocalSync } from "@/features/sync/local-sync";
import { getSession } from "@/lib/auth/session";

/**
 * Session-aware shell body. Resolves the session inside the caller's Suspense boundary
 * so the shell markup can still prerender (PPR) and only the dynamic bits stream in.
 */
export default async function ShellBody({ children, mainClassName }: { children: ReactNode; mainClassName?: string }) {
  const s = await getSession();
  return (
    <AppShell guest={!s} user={s ? { name: s.profile?.display_name || s.user.email, cls: s.profile?.class ?? null, year: s.profile?.neet_year ?? null } : undefined} right={<><ThemeToggle /><UserMenu /></>}>
      {s && <LocalSync />}
      <main id="main" className={mainClassName}>
        <AppGate>{children}</AppGate>
      </main>
    </AppShell>
  );
}

export function ShellFallback() {
  return (
    <div className="min-h-dvh bg-canvas" aria-hidden>
      <div className="fixed hidden h-dvh w-[232px] border-r border-line bg-surface lg:block" />
      <div className="lg:pl-[232px]">
        <div className="h-14 border-b border-line" />
        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
