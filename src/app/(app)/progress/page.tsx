import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Progress" };

type StatsRow = { day: string; answered: number; correct: number };

/** Real overview from daily_stats (no invented streaks or leaderboards). */
export default async function ProgressPage() {
  const s = await getSession();
  const supabase = await createClient();
  const { data } = await supabase.from("daily_stats").select("day, answered, correct").order("day", { ascending: false }).limit(30);
  const rows = ((data ?? []) as StatsRow[]).slice();
  const answered = rows.reduce((n, r) => n + r.answered, 0);
  const correct = rows.reduce((n, r) => n + r.correct, 0);
  const active = rows.filter((r) => r.answered > 0).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Progress</h1>
        <p className="mt-1 text-sm text-ink-2">Your answers, day by day — exactly what you did, nothing more.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Questions answered", value: String(answered) },
          { label: "Correct", value: String(correct) },
          { label: "Accuracy", value: accuracy === null ? "—" : `${accuracy}%` },
          { label: "Active days (30)", value: String(active) },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{t.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-ink">{t.value}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-2">
          No attempts recorded yet{s ? "" : " — and guests are not saved"}. Answers show up here after you practise a page.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
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
      )}
    </div>
  );
}
