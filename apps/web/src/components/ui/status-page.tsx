import type { ReactNode } from "react";

/** Full-screen message used by error, not-found and similar states. Token based, works in both themes. */
export function StatusPage({ code, title, children, actions }: { code?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {code ? <p className="text-5xl font-bold text-brand-text" aria-hidden="true">{code}</p> : null}
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {children ? <p className="text-sm leading-6 text-ink-2">{children}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </main>
  );
}
