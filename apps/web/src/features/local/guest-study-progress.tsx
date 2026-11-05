"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { progressOf } from "@/features/study";
import { listLocalProgress } from "@/lib/local/store";
import type { LocalProgress } from "@/lib/local/types";

/** "Continue studying" for guests, read from this browser's IndexedDB. */
export function GuestStudyProgress() {
  const [rows, setRows] = useState<LocalProgress[] | null>(null);

  useEffect(() => {
    let alive = true;
    void listLocalProgress()
      .then((list) => { if (alive) setRows([...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at))); })
      .catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, []);

  if (!rows || rows.length === 0) return null;
  const recent = rows[0];
  const pr = progressOf({ pageCount: recent.page_count }, recent);

  return (
    <section aria-labelledby="guest-continue-h" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="guest-continue-h" className="text-sm font-semibold text-ink">Continue studying</h2>
        <span className="text-xs text-muted">Saved in this browser</span>
      </div>
      <Link href={`/study/${recent.chapter_slug}?p=${recent.last_page}`} className="group mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-canvas p-3 transition-colors hover:bg-surface-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-ink group-hover:text-brand-text">{recent.chapter_title}</p>
          <p className="text-xs text-ink-2">PDF page {recent.last_page} of {pr.total}</p>
        </div>
        <div className="w-40" role="progressbar" aria-valuenow={pr.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`read ${pr.pct}% of the chapter`}>
          <div className="h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${pr.pct}%` }} /></div>
        </div>
      </Link>
      {rows.length > 1 && (
        <ul className="mt-2 divide-y divide-line">
          {rows.slice(1, 3).map((p) => {
            const pp = progressOf({ pageCount: p.page_count }, p);
            return (
              <li key={p.chapter_id}>
                <Link href={`/study/${p.chapter_slug}?p=${p.last_page}`} className="group flex flex-wrap items-center justify-between gap-x-3 py-2">
                  <span className="min-w-0 truncate text-sm text-ink group-hover:text-brand-text">{p.chapter_title}</span>
                  <span className="shrink-0 text-xs text-ink-2">page {p.last_page} of {pp.total} · {pp.pct}%</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">
        Stored on this device. <Link href="/sign-in?next=%2Fstudy" className="font-medium text-brand-text underline underline-offset-2">Sign in</Link> to sync it.
      </p>
    </section>
  );
}
