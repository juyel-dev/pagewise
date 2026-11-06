"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, Target } from "lucide-react";
import { listLocalAttempts, listLocalProgress } from "@/lib/local/store";
import type { LocalAttempt, LocalProgress } from "@/lib/local/types";

const card = "rounded-2xl border border-line bg-surface shadow-sm";
const cta = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover";
const ctaSecondary = "inline-flex h-10 items-center rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:bg-surface-2";

/** Guest Home panel: real local data when it exists, free/start copy when it does not. */
export function GuestHomePanel() {
  const [data, setData] = useState<{ progress: LocalProgress[]; attempts: LocalAttempt[] } | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([listLocalProgress(), listLocalAttempts()])
      .then(([progress, attempts]) => { if (alive) setData({ progress, attempts }); })
      .catch(() => { if (alive) setData({ progress: [], attempts: [] }); });
    return () => { alive = false; };
  }, []);

  if (data === null) {
    return <section aria-label="Get started" className={`${card} p-6`}><p className="text-sm text-ink-2">Loading your local progress…</p></section>;
  }

  const answered = data.attempts.length;
  const correct = data.attempts.filter((a) => a.is_correct).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
  const resume = [...data.progress].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  if (!resume && answered === 0) {
    return (
      <section aria-label="Get started" className={`${card} p-6`}>
        <h2 className="text-lg font-semibold text-ink">Everything is free — start without an account</h2>
        <ul className="mt-2 max-w-prose space-y-1.5 text-sm text-ink-2">
          <li>Every chapter, every page and every question is open to guests. No paywall, ever.</li>
          <li>Your reading progress, answers and bookmarks stay in this browser.</li>
          <li>Sign in with Google only when you want them synced across your devices.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/study" className={cta}>Start studying</Link>
          <Link href="/sign-in?next=%2Fhome" className={ctaSecondary}>Sign in to sync</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`${card} p-4`}>
          <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-text"><Target className="size-5" /></span>
          <p className="mt-3 text-xs text-muted">Answered in this browser</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">{answered}</p>
        </div>
        <div className={`${card} p-4`}>
          <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-good-soft text-good"><BarChart3 className="size-5" /></span>
          <p className="mt-3 text-xs text-muted">Correct</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">{correct}</p>
        </div>
        <div className={`${card} col-span-2 p-4 sm:col-span-1`}>
          <p className="text-xs text-muted">Accuracy</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">{accuracy === null ? "—" : `${accuracy}%`}</p>
          <p className="mt-1 text-xs text-muted">Local only — sign in to sync</p>
        </div>
      </div>

      {resume && (
        <section aria-label="Continue studying" className={`${card} p-5`}>
          <p className="text-xs text-muted">Continue where you left off</p>
          <p className="mt-0.5 font-semibold text-ink">{resume.chapter_title}</p>
          <p className="mt-1 text-sm text-ink-2">PDF page {resume.last_page} of {Math.max(resume.page_count, resume.last_page)} · saved in this browser</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/study/${resume.chapter_slug}?p=${resume.last_page}`} className={cta}>Continue reading</Link>
            <Link href="/progress" className={`${ctaSecondary} gap-1`}>Progress <ArrowRight className="size-4" aria-hidden /></Link>
            <Link href="/sign-in?next=%2Fhome" className="inline-flex h-10 items-center px-1 text-sm font-medium text-brand-text underline underline-offset-2">Sign in to sync</Link>
          </div>
        </section>
      )}
    </div>
  );
}
