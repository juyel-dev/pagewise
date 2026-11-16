import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress";

/** Back link, chapter title, draft marker and how much of the chapter has been read (docs/walkthrough/06 §3). */
export function WorkspaceHeader({ backHref, backLabel, title, draft, seen, total }: { backHref: string; backLabel: string; title: string; draft: boolean; seen: number; total: number }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 sm:px-4">
      <Link href={backHref} aria-label={`Back to ${backLabel}`} className="inline-flex h-8 items-center gap-1 rounded-full pr-2 text-label text-ink-2 hover:bg-surface-2 hover:text-ink pointer-coarse:h-11">
        <ChevronLeft className="size-5" aria-hidden="true" /><span className="hidden sm:inline">{backLabel}</span>
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-label text-ink" title={title}>{title}</h1>
      {draft ? <Badge tone="accent">Draft</Badge> : null}
      {total > 0 ? (
        <div className="hidden items-center gap-2 md:flex">
          <ProgressBar value={Math.min(seen, total)} max={total} label="Reading progress" className="w-24" />
          <span className="text-small text-ink-2 tabular-nums">{Math.min(seen, total)} of {total} pages read</span>
        </div>
      ) : null}
    </div>
  );
}
