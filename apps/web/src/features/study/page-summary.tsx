import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import type { PageSummary as Summary } from "./logic";

/** Shown after the last question of a page is checked and the student moves on. Counts use first attempts only. */
export function PageSummary({ summary, nextPageLabel, onNextPage, onRetryMissed, onKeepReading }: { summary: Summary; nextPageLabel?: string; onNextPage?: () => void; onRetryMissed: () => void; onKeepReading: () => void }) {
  return (
    <section aria-label="Page complete" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <h3 className="flex items-center gap-2 text-h3 text-ink"><CheckCircle2 className="size-6 text-good" aria-hidden="true" />Page complete</h3>
      <div className="flex flex-col gap-2">
        <p className="text-body text-ink"><span className="tabular-nums">{summary.correct} of {summary.total}</span> correct</p>
        <ProgressBar value={summary.correct} max={summary.total} label="Correct answers on this page" />
      </div>
      <div className="flex flex-wrap gap-2">
        {onNextPage ? <Button onClick={onNextPage}>Next page with questions{nextPageLabel ? ` (p.${nextPageLabel})` : ""} →</Button> : null}
        {summary.wrongIds.length > 0 ? <Button variant="secondary" onClick={onRetryMissed}>Retry the ones you missed</Button> : null}
        <Button variant="ghost" onClick={onKeepReading}>Keep reading</Button>
      </div>
    </section>
  );
}
