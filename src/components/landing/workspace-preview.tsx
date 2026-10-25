import { Bookmark, Check, ChevronLeft, ChevronRight, Flag, Flame, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** Illustrative, non-interactive preview of the study workspace. */
const lineWidths = [100, 96, 100, 88, 100, 72, 100, 94, 100, 64];
const options = [
  { key: "A", text: "Golgi apparatus" }, { key: "B", text: "Mitochondria", correct: true },
  { key: "C", text: "Lysosome" }, { key: "D", text: "Ribosome" },
];
export function WorkspacePreview() {
  return (
    <div role="img" aria-label="Preview of the workspace: a textbook page on the left and a practice question from that page on the right." className="relative mx-auto w-full max-w-5xl">
      <div aria-hidden className="absolute -inset-x-4 -top-6 -bottom-10 -z-10 rounded-[2.5rem] bg-gradient-to-b from-brand-soft via-brand-soft/40 to-transparent blur-2xl sm:-inset-x-10" />
      <div aria-hidden className="overflow-hidden rounded-2xl border border-line bg-surface shadow-window">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5"><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" /></div><div className="min-w-0 flex-1 truncate rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">Biology <span className="mx-1">›</span> Class 11 <span className="mx-1">›</span> <span className="text-ink-2">Cell: The Unit of Life</span></div><div className="hidden items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-text sm:flex"><Flame className="size-3.5" /> 7</div></div>
        <div className="grid md:grid-cols-[1.02fr_1fr]">
          <div className="hidden border-r border-line bg-surface-2 p-5 md:block">
            <div className="mb-3 flex items-center justify-between text-xs text-muted"><span className="font-medium">Official NCERT PDF</span><span className="flex items-center gap-2"><ChevronLeft className="size-4" /><span className="tabular-nums">12 / 20</span><ChevronRight className="size-4" /><span className="mx-1 h-3 w-px bg-line" /><Minus className="size-3.5" /><span className="tabular-nums">100%</span><Plus className="size-3.5" /></span></div>
            <div className="rounded-lg border border-line bg-white p-6 shadow-card dark:bg-[#1a2420]"><div className="h-3.5 w-2/5 rounded bg-ink/80" /><div className="mt-5 space-y-2.5">{lineWidths.slice(0, 5).map((w, i) => <div key={i} className="h-2 rounded bg-ink/15" style={{ width: `${w}%` }} />)}</div>
              <div className="my-5 flex h-24 items-center justify-center gap-3 rounded-md border border-dashed border-line bg-brand-soft"><div className="size-12 rounded-full border-2 border-brand/50 bg-surface/70" /><div className="h-8 w-14 rounded-full border-2 border-brand/40" /><div className="size-6 rounded-full border-2 border-brand/50" /></div>
              <div className="space-y-2.5">{lineWidths.slice(5).map((w, i) => <div key={i} className="h-2 rounded bg-ink/15" style={{ width: `${w}%` }} />)}</div>
            </div>
          </div>
          <div className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold">Practice · this page</p><p className="mt-0.5 text-xs text-muted">Question 3 of 6</p></div><div className="flex items-center gap-1.5">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={cn("size-2 rounded-full", i < 2 ? "bg-brand" : i === 2 ? "bg-brand ring-4 ring-brand-soft" : "bg-line")} />)}</div></div>
            <div className="rounded-xl border border-line bg-canvas p-4 sm:p-5"><div className="flex items-center gap-2 text-xs"><span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand-text">MCQ</span><span className="rounded-full border border-line px-2.5 py-1 text-muted">Medium</span><span className="ml-auto flex items-center gap-2 text-muted"><Bookmark className="size-4" /><Flag className="size-4" /></span></div>
              <p className="mt-3 text-[15px] leading-6 font-medium">Which cell organelle contains its own circular DNA and is known as the &ldquo;powerhouse of the cell&rdquo;?</p>
              <ul className="mt-4 space-y-2">{options.map((o) => <li key={o.key} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm", o.correct ? "border-good/40 bg-good-soft font-medium text-ink" : "border-line bg-surface text-ink-2")}><span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold", o.correct ? "bg-good text-white dark:text-black" : "bg-surface-2 text-muted")}>{o.correct ? <Check className="size-3.5" strokeWidth={3} /> : o.key}</span>{o.text}</li>)}</ul>
              <div className="mt-4 rounded-lg border-l-2 border-good bg-good-soft/60 px-3 py-2.5 text-xs leading-5 text-ink-2"><span className="font-semibold text-ink">Correct.</span> Mitochondria carry their own circular DNA and ribosomes. <span className="font-medium text-brand-text">See the source page →</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
