"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, X } from "lucide-react";
import { listLocalBookmarks, removeLocalBookmark } from "@/lib/local/store";
import type { LocalBookmark } from "@/lib/local/types";

const cta = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover";

/** Guest bookmark list, read straight from this browser's IndexedDB. */
export function GuestBookmarks() {
  const [items, setItems] = useState<LocalBookmark[] | null>(null);

  useEffect(() => {
    let alive = true;
    void listLocalBookmarks()
      .then((rows) => {
        if (alive) setItems([...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function remove(questionId: string) {
    setItems((rows) => rows?.filter((r) => r.question_id !== questionId) ?? rows);
    try {
      await removeLocalBookmark(questionId);
    } catch {
      const rows = await listLocalBookmarks().catch(() => []);
      setItems([...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)));
    }
  }

  if (items === null) {
    return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-2">Loading your saved questions…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-2">
        <span className="font-medium text-ink">Saved in this browser.</span> Sign in whenever you like to sync these bookmarks to your account.
      </p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-6">
          <p className="text-sm text-ink-2">Nothing saved yet. Bookmark questions in the chapter workspace and they collect here — no account needed.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/study" className={cta}>Start studying</Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((r) => (
            <li key={r.question_id} className="group flex items-center gap-2 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
              <Link href={`/study/${r.chapter_slug}?p=${r.page}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text"><Bookmark className="size-4" /></span>
                <p className="min-w-0 flex-1 text-sm font-medium text-ink group-hover:text-brand-text">{r.stem}</p>
                <span className="shrink-0 text-xs text-muted">{r.chapter_title} · page {r.page}</span>
              </Link>
              <button type="button" onClick={() => void remove(r.question_id)} aria-label={`Remove bookmark: ${r.stem}`}
                className="shrink-0 rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink">
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
