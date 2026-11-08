import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Icon, one title, one sentence, at most one action. */
export function EmptyState({ icon, title, children, action, className }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      {icon ? <div className="text-muted [&>svg]:size-6" aria-hidden="true">{icon}</div> : null}
      <h3 className="text-h3 text-ink">{title}</h3>
      {children ? <p className="max-w-sm text-small text-ink-2">{children}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
