"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listLocalAttempts } from "@/lib/local/store";
import type { LocalAttempt } from "@/lib/local/types";

const STUDY_TIME_ZONE = "Asia/Kolkata";
const cta = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover";

type DayRow = { day: string; answered: number; correct: number };

/** Guest progress dashboard, computed from answers kept in this browser. */
export function GuestProgress() {
  const [data, setData] = useState<{ attempts: LocalAttempt[]; since: number } | null>(null);

  useEffect(() => {
    let alive = true;
    // Timestamp captured once when the data loads, so render stays pure.
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    void listLocalAttempts()
      .then((rows) => { if (alive) setData({ attempts: rows, since }); })
      .catch(() => { if (alive) setData({ attempts: [], since }); });
    return () => { alive = false; };
  }, []);

  if (data === null) {
    return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-2">Loading your local progress…</p>;
  }

  const recent = data.attempts.filter((a) => Date.parse(a.created_at) >= data.since);
  const byDay = new Map<string, DayRow>();
  for (const a of recent) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: STUDY_TIME_ZONE }).format(new Date(a.created_at));
    const row = byDay.get(day) ?? { day, answered: 0, correct: 0 };
    row.answered += 1;
    if (a.is_correct) row.correct += 1;
    byDay.set(day, row);
  }
  const rows = [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day));
  const answered = recent.length;
  const correct = recent.filter((a) => a.is_correct).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-2">
        <span className="font-medium text-ink">Saved in this browser.</span> These answers stop at 30 days and never leave this device until you sign in.
        {" "}<Link href="/sign-in?next=%2Fprogress" className="font-medium text-brand-text underline underline-offset-2">Sign in to sync</Link>.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Questions answered", value: String(answered) },
          { label: "Correct", value: String(correct) },
          { label: "Accuracy", value: accuracy === null ? "—" : `${accuracy}%` },
          { label: "Active days (30)", value: String(rows.length) },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{t.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-ink">{t.value}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-6">
          <p className="text-sm text-ink-2">No answers in this browser yet. Practise a page and every checked answer appears here — no account needed.</p>
          <div className="mt-4"><Link href="/study" className={cta}>Start practising</Link></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-[32rem] w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Day</th>
                  <th className="px-4 py-2.5 font-medium">Answered</th>
                  <th className="px-4 py-2.5 font-medium">Correct</th>
                  <th className="px-4 py-2.5 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.day} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-2.5 text-ink">{r.day}</td>
                    <td className="px-4 py-2.5 text-ink-2">{r.answered}</td>
                    <td className="px-4 py-2.5 text-ink-2">{r.correct}</td>
                    <td className="px-4 py-2.5 text-ink-2">{r.answered > 0 ? `${Math.round((r.correct / r.answered) * 100)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
