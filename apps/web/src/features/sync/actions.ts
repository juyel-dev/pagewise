"use server";

import { getSession } from "@/lib/auth/session";
import type { LocalSnapshot } from "@/lib/local/types";
import { createClient } from "@/lib/supabase/server";
import { mergeProgress } from "./merge";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX = { bookmarks: 500, progress: 200, attempts: 1500 };

export type SyncResult = { ok: boolean; error?: string; counts?: { bookmarks: number; progress: number; attempts: number } };

function iso(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function pageOf(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), 2000) : 1;
}

function pagesOf(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 2000))].sort((a, b) => a - b);
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/**
 * Merge this browser's guest data into the signed-in account.
 * Safe to retry: bookmarks and attempts ignore duplicates; progress is unioned.
 */
export async function syncLocalData(input: LocalSnapshot): Promise<SyncResult> {
  const s = await getSession();
  if (!s) return { ok: false, error: "Not signed in." };

  const bookmarks = (Array.isArray(input?.bookmarks) ? input.bookmarks : [])
    .filter((b) => b && UUID.test(b.question_id))
    .slice(0, MAX.bookmarks)
    .map((b) => ({ user_id: s.user.id, question_id: b.question_id, created_at: iso(b.created_at) ?? new Date().toISOString() }));

  const progress = (Array.isArray(input?.progress) ? input.progress : [])
    .filter((p) => p && UUID.test(p.chapter_id))
    .slice(0, MAX.progress)
    .map((p) => ({
      chapter_id: p.chapter_id,
      last_page: pageOf(p.last_page),
      pages_seen: pagesOf(p.pages_seen),
      updated_at: iso(p.updated_at) ?? new Date().toISOString(),
    }));

  const attempts = (Array.isArray(input?.attempts) ? input.attempts : [])
    .filter((a) => a && UUID.test(a.question_id) && (a.version_id === null || UUID.test(a.version_id)))
    .filter((a) => Array.isArray(a.chosen) && a.chosen.length >= 1 && a.chosen.length <= 8 && a.chosen.every((n) => Number.isInteger(n) && n >= 0 && n <= 9))
    .slice(0, MAX.attempts)
    .map((a) => ({
      user_id: s.user.id,
      question_id: a.question_id,
      version_id: a.version_id ?? null,
      chosen: a.chosen.slice(0, 8),
      time_ms: Math.min(Math.max(Math.round(Number(a.time_ms)) || 0, 0), 3_600_000),
      attempt_no: Math.min(Math.max(Math.round(Number(a.attempt_no)) || 1, 1), 1000),
      source: String(a.source ?? "sync").slice(0, 20),
      release: String(a.release ?? "local").slice(0, 40),
      created_at: iso(a.created_at) ?? new Date().toISOString(),
    }));

  if (bookmarks.length + progress.length + attempts.length === 0) {
    return { ok: true, counts: { bookmarks: 0, progress: 0, attempts: 0 } };
  }

  const supabase = await createClient();

  // 1. Bookmarks — union; existing rows stay as they are.
  if (bookmarks.length > 0) {
    for (const batch of chunk(bookmarks, 500)) {
      const { error } = await supabase.from("bookmarks").upsert(batch, { onConflict: "user_id,question_id", ignoreDuplicates: true });
      if (error) return { ok: false, error: "bookmarks" };
    }
  }

  // 2. Reading progress — union pages seen, newest copy wins for the last page.
  if (progress.length > 0) {
    const existing: { chapter_id: string; last_page: number | null; pages_seen: number[] | null; updated_at: string }[] = [];
    for (const batch of chunk(progress.map((p) => p.chapter_id), 100)) {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("chapter_id, last_page, pages_seen, updated_at")
        .eq("user_id", s.user.id)
        .in("chapter_id", batch);
      if (error) return { ok: false, error: "progress" };
      existing.push(...((data ?? []) as typeof existing));
    }
    const merged = mergeProgress(progress, existing).map((r) => ({ ...r, user_id: s.user.id }));
    const { error } = await supabase.from("reading_progress").upsert(merged, { onConflict: "user_id,chapter_id" });
    if (error) return { ok: false, error: "progress" };
  }

  // 3. Attempts — append; duplicates by (question, attempt number) are ignored.
  //    is_correct is set by the database (migration 0007); guest values are never trusted.
  if (attempts.length > 0) {
    for (const batch of chunk(attempts, 500)) {
      const { error } = await supabase.from("attempts").upsert(batch, { onConflict: "user_id,question_id,attempt_no", ignoreDuplicates: true });
      if (error) return { ok: false, error: "attempts" };
    }
  }

  return { ok: true, counts: { bookmarks: bookmarks.length, progress: progress.length, attempts: attempts.length } };
}
