"use client";
import type { ContentQuestion, QState } from "./types";

const btn = "inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";

export function QuestionCard({ q, index, total, state, bookmarked, onPick, onCheck, onRetry, onBookmark, onSource }: {
  q: ContentQuestion; index: number; total: number; state: QState | undefined; bookmarked: boolean;
  onPick: (i: number) => void; onCheck: () => void; onRetry: () => void; onBookmark: () => void; onSource: () => void;
}) {
  const p = q.payload;
  const checked = state?.checked ?? false;
  const chosen = state?.chosen ?? null;
  const correct = checked && chosen === p.answer;
  return (
    <article className="rounded-2xl border border-line bg-surface p-4" aria-label={`Question ${index + 1} of ${total}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink"><span className="mr-1 text-muted">{index + 1}.</span>{p.stem}</p>
        <button type="button" onClick={onBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
          className={`shrink-0 rounded-md px-2 py-1 text-xs ${bookmarked ? "bg-brand-soft text-brand-text" : "text-muted hover:bg-surface-2"}`}>
          {bookmarked ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      <div role="radiogroup" aria-label="Options" className="mt-3 space-y-2">
        {p.options.map((o, oi) => {
          const picked = chosen === oi;
          const tone = checked
            ? oi === p.answer ? "border-good bg-good-soft" : picked ? "border-bad bg-bad-soft" : "border-line"
            : picked ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-2";
          return (
            <button key={oi} type="button" role="radio" aria-checked={picked} disabled={checked} onClick={() => onPick(oi)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm text-ink ${tone}`}>
              <span className="mr-2 font-medium">{"ABCD"[oi]}.</span>{o}
              {checked && oi === p.answer && <span className="ml-2 font-medium text-good">✓ Correct answer</span>}
              {checked && picked && oi !== p.answer && <span className="ml-2 font-medium text-bad">✗ Your answer</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!checked && <button type="button" className={btn} disabled={chosen === null} onClick={onCheck}>Check</button>}
        {checked && <button type="button" className={btn} onClick={onSource}>See source page</button>}
        {checked && <button type="button" className={btn} onClick={onRetry}>Try again</button>}
      </div>
      {checked && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-ink-2" role="status">
          <p className="font-medium text-ink">{correct ? "Correct." : "Not quite."}</p>
          <p className="mt-1">{p.explanation}</p>
          {state && state.attemptNo > 1 && <p className="mt-2 text-xs text-muted">Only your first attempt counts toward your accuracy.</p>}
        </div>
      )}
    </article>
  );
}
