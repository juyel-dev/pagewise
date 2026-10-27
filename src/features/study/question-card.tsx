"use client";
import { isCorrect } from "@/lib/question-bank/format";
import type { QState, StudyQuestion } from "./types";

const btn = "inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2 disabled:opacity-50";
const STATUS_LABEL: Record<string, string> = { in_review: "In review", published: "Published", draft: "Draft", flagged: "Flagged", retired: "Retired", auto_checked: "Checked" };

export type ReviewControls = { busy: boolean; onSet: (s: "published" | "in_review" | "retired") => void };

export function QuestionCard({ q, index, total, state, bookmarked, review, onPick, onCheck, onRetry, onBookmark, onSource }: {
  q: StudyQuestion; index: number; total: number; state?: QState; bookmarked?: boolean; review?: ReviewControls;
  onPick?: (i: number) => void; onCheck?: () => void; onRetry?: () => void; onBookmark?: () => void; onSource?: () => void;
}) {
  const p = q.payload;
  const multi = q.type === "multiple_correct";
  const checked = state?.checked ?? false;
  const chosen = state?.chosen ?? [];
  const reveal = checked || Boolean(review);
  const correct = checked && isCorrect(chosen, p.correct);
  return (
    <article className="rounded-2xl border border-line bg-surface p-4" aria-label={`Question ${index + 1} of ${total}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {p.topic && <p className="mb-1 text-xs text-muted">{p.topic} · {q.difficulty}</p>}
          <p className="whitespace-pre-line text-sm font-medium text-ink"><span className="mr-1 text-muted">{index + 1}.</span>{p.question}</p>
        </div>
        {!review && onBookmark && (
          <button type="button" onClick={onBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
            className={`shrink-0 rounded-md px-2 py-1 text-xs ${bookmarked ? "bg-brand-soft text-brand-text" : "text-muted hover:bg-surface-2"}`}>
            {bookmarked ? "★ Saved" : "☆ Save"}
          </button>
        )}
        {review && <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-2">{STATUS_LABEL[q.status] ?? q.status}</span>}
      </div>

      {q.type === "match_the_following" && p.column_a && p.column_b && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-surface-2 p-3 text-sm text-ink">
          <ul className="space-y-1">{p.column_a.map((c, i) => <li key={i}>{c}</li>)}</ul>
          <ul className="space-y-1">{p.column_b.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}
      {multi && !reveal && <p className="mt-2 text-xs text-muted">Select all that apply.</p>}

      <div role={multi ? "group" : "radiogroup"} aria-label="Options" className="mt-3 space-y-2">
        {p.options.map((o, oi) => {
          const picked = chosen.includes(oi);
          const isAns = p.correct.includes(oi);
          const tone = reveal
            ? isAns ? "border-good bg-good-soft" : picked ? "border-bad bg-bad-soft" : "border-line"
            : picked ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-2";
          return (
            <button key={oi} type="button" role={multi ? "checkbox" : "radio"} aria-checked={picked} disabled={reveal} onClick={() => onPick?.(oi)}
              className={`block w-full whitespace-pre-line rounded-lg border px-3 py-2 text-left text-sm text-ink ${tone}`}>
              <span className="mr-2 font-medium">{"ABCDEFGH"[oi]}.</span>{o}
              {reveal && isAns && <span className="ml-2 font-medium text-good">✓ {review ? "Correct" : "Correct answer"}</span>}
              {checked && picked && !isAns && <span className="ml-2 font-medium text-bad">✗ Your answer</span>}
            </button>
          );
        })}
      </div>

      {!review && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!checked && <button type="button" className={btn} disabled={chosen.length === 0} onClick={onCheck}>Check</button>}
          {checked && <button type="button" className={btn} onClick={onSource}>See source page</button>}
          {checked && <button type="button" className={btn} onClick={onRetry}>Try again</button>}
        </div>
      )}

      {reveal && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-ink-2" role="status">
          {!review && <p className="font-medium text-ink">{correct ? "Correct." : "Not quite."}</p>}
          <p className={review ? "" : "mt-1"}>{p.explanation}</p>
          <p className="mt-2 text-xs text-muted">From the page: “{p.source_text}”</p>
          {!review && state && state.attemptNo > 1 && <p className="mt-2 text-xs text-muted">Only your first attempt counts toward your accuracy.</p>}
          {review && <p className="mt-1 text-xs text-muted">{p.question_origin} · {p.verification}</p>}
        </div>
      )}

      {review && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={review.busy || q.status === "published"} onClick={() => review.onSet("published")}>Publish</button>
          <button type="button" className={btn} disabled={review.busy || q.status === "in_review"} onClick={() => review.onSet("in_review")}>Send back to review</button>
          <button type="button" className={btn} disabled={review.busy || q.status === "retired"} onClick={() => review.onSet("retired")}>Retire</button>
        </div>
      )}
    </article>
  );
}
