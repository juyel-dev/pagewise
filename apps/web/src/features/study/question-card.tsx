"use client";
import { isCorrect } from "@pagewise/question-schema";
import { CheckCircle2, Star, XCircle } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Badge } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SourceQuote } from "./source-quote";
import type { QState, StudyQuestion } from "./types";

const STATUS_LABEL: Record<string, string> = { in_review: "In review", published: "Published", draft: "Draft", flagged: "Flagged", retired: "Retired", auto_checked: "Checked" };
const DIFFICULTY_TONE = { easy: "good", medium: "accent", hard: "bad" } as const;
const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

export type ReviewControls = { busy: boolean; onSet: (s: "published" | "in_review" | "retired") => void };

type Props = {
  q: StudyQuestion; index: number; total: number; state?: QState; bookmarked?: boolean; review?: ReviewControls;
  onPick?: (i: number) => void; onCheck?: () => void; onRetry?: () => void; onBookmark?: () => void; onSource?: () => void;
};

/** One question: header, stem, options, then (after Check) the result with explanation and source line. Visual spec: docs/walkthrough/06-study-workspace.md §3. */
export function QuestionCard({ q, index, total, state, bookmarked, review, onPick, onCheck, onRetry, onBookmark, onSource }: Props) {
  const p = q.payload;
  const multi = q.type === "multiple_correct";
  const checked = state?.checked ?? false;
  const chosen = state?.chosen ?? [];
  const reveal = checked || Boolean(review);
  const correct = checked && isCorrect(chosen, p.correct);
  const difficulty = q.difficulty in DIFFICULTY_TONE ? (q.difficulty as keyof typeof DIFFICULTY_TONE) : null;

  function onOptionKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (multi || reveal) return;
    const key = event.key;
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(key)) return;
    const group = event.currentTarget.parentElement;
    const options = group ? Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')) : [];
    const current = options.indexOf(event.currentTarget);
    if (current < 0 || options.length === 0) return;
    event.preventDefault();
    const next = key === "Home" ? 0 : key === "End" ? options.length - 1 : (current + (key === "ArrowRight" || key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    options[next].focus();
    options[next].click();
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5" aria-label={`Question ${index + 1} of ${total}`}>
      <div className="flex flex-wrap items-center gap-2">
        {p.topic ? <Badge>{p.topic}</Badge> : null}
        {difficulty ? <Badge tone={DIFFICULTY_TONE[difficulty]}>{DIFFICULTY_LABEL[difficulty]}</Badge> : null}
        <span className="ml-auto text-small text-ink-2 tabular-nums">{index + 1} of {total}</span>
        {!review && onBookmark ? (
          <button type="button" onClick={onBookmark} aria-pressed={bookmarked} aria-label="Save question"
            className={cn("inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-caption transition-colors pointer-coarse:h-11", bookmarked ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-surface-2")}>
            <Star className={cn("size-4", bookmarked && "fill-current")} aria-hidden="true" />
            Save
          </button>
        ) : null}
        {review ? <Badge>{STATUS_LABEL[q.status] ?? q.status}</Badge> : null}
      </div>

      <p className="whitespace-pre-line text-question text-ink">{p.question}</p>

      {q.type === "match_the_following" && p.column_a && p.column_b ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl bg-surface-2 p-3 text-body text-ink sm:grid-cols-2">
          <ul className="space-y-1">{p.column_a.map((c, i) => <li key={i}>{c}</li>)}</ul>
          <ul className="space-y-1">{p.column_b.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      ) : null}
      {multi && !reveal ? <p className="text-small text-muted">Select all that apply.</p> : null}

      <div role={multi ? "group" : "radiogroup"} aria-label="Options" className="flex flex-col gap-2">
        {p.options.map((o, oi) => {
          const picked = chosen.includes(oi);
          const isAns = p.correct.includes(oi);
          const tone = reveal
            ? isAns ? "border-good bg-good-soft" : picked ? "border-bad bg-bad-soft" : "border-line"
            : picked ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-2";
          const badge = reveal ? (isAns ? "bg-good text-white" : picked ? "bg-bad text-white" : "bg-surface-2 text-ink-2") : picked ? "bg-brand text-white" : "bg-surface-2 text-ink-2";
          return (
            <button key={oi} type="button" role={multi ? "checkbox" : "radio"} aria-checked={picked}
              tabIndex={multi ? undefined : picked || (chosen.length === 0 && oi === 0) ? 0 : -1}
              disabled={reveal} onClick={() => onPick?.(oi)} onKeyDown={onOptionKey}
              className={cn("flex min-h-[52px] w-full items-start gap-3 rounded-xl border p-3 text-left text-body text-ink transition-colors active:scale-[0.995] motion-reduce:active:scale-100", tone)}>
              <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-label tabular-nums", badge)}>{oi + 1}</span>
              <span className="flex-1 whitespace-pre-line pt-0.5">{o}</span>
              {reveal && isAns ? <span className="shrink-0 pt-0.5 text-label text-good">✓ {review ? "Correct" : "Correct answer"}</span> : null}
              {checked && picked && !isAns ? <span className="shrink-0 pt-0.5 text-label text-bad">✗ Your answer</span> : null}
            </button>
          );
        })}
      </div>

      {!review && !checked ? <div><Button disabled={chosen.length === 0} onClick={onCheck}>Check</Button></div> : null}

      {reveal ? (
        <div role="status" className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
          {!review ? (
            <p className="flex items-center gap-2 text-label">
              {correct ? <CheckCircle2 className="size-5 text-good" aria-hidden="true" /> : <XCircle className="size-5 text-bad" aria-hidden="true" />}
              <span className={correct ? "text-good" : "text-bad"}>{correct ? "Correct." : "Not quite."}</span>
            </p>
          ) : null}
          <p className="text-body text-ink-2">{p.explanation}</p>
          <SourceQuote text={p.source_text} />
          {!review && state && state.attemptNo > 1 ? <p className="text-caption text-muted">Only your first attempt counts toward your accuracy.</p> : null}
          {review ? <p className="text-caption text-muted">{p.question_origin} · {p.verification}</p> : null}
          {!review && checked ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={onSource}>Show in NCERT</Button>
              <Button variant="ghost" size="sm" onClick={onRetry}>Try again</Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {review ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" disabled={review.busy || q.status === "published"} onClick={() => review.onSet("published")}>Publish</Button>
          <Button variant="secondary" size="sm" disabled={review.busy || q.status === "in_review"} onClick={() => review.onSet("in_review")}>Send back to review</Button>
          <Button variant="secondary" size="sm" disabled={review.busy || q.status === "retired"} onClick={() => review.onSet("retired")}>Retire</Button>
        </div>
      ) : null}
    </article>
  );
}
