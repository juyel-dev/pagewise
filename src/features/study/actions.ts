"use server";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: boolean };

async function authed() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function recordAttempt(i: {
  questionId: string; versionId: string; chosen: number[]; isCorrect: boolean; timeMs: number; attemptNo: number; release: string; source: string;
}): Promise<Result> {
  if (!UUID.test(i.questionId) || !UUID.test(i.versionId) || !Array.isArray(i.chosen) || i.chosen.length < 1 || i.chosen.length > 8 || !i.chosen.every((n) => Number.isInteger(n) && n >= 0 && n <= 9)) return { ok: false };
  if (!Number.isInteger(i.attemptNo) || i.attemptNo < 1 || i.attemptNo > 50) return { ok: false };
  const { supabase, user } = await authed();
  if (!user) return { ok: false };
  const { error } = await supabase.from("attempts").insert({
    user_id: user.id, question_id: i.questionId, version_id: i.versionId, chosen: i.chosen, is_correct: Boolean(i.isCorrect),
    time_ms: Math.min(Math.max(Math.round(i.timeMs) || 0, 0), 3_600_000), attempt_no: i.attemptNo,
    source: String(i.source).slice(0, 20), release: String(i.release).slice(0, 40),
  });
  return { ok: !error || error.code === "23505" }; // duplicate = already saved
}

export async function saveProgress(i: { chapterId: string; lastPage: number; pagesSeen: number[] }): Promise<Result> {
  if (!UUID.test(i.chapterId) || !Number.isInteger(i.lastPage) || i.lastPage < 1 || i.lastPage > 2000) return { ok: false };
  const seen = [...new Set(i.pagesSeen.filter((n) => Number.isInteger(n) && n >= 1 && n <= 2000))].sort((a, b) => a - b);
  const { supabase, user } = await authed();
  if (!user) return { ok: false };
  const { error } = await supabase.from("reading_progress").upsert(
    { user_id: user.id, chapter_id: i.chapterId, last_page: i.lastPage, pages_seen: seen, updated_at: new Date().toISOString() },
    { onConflict: "user_id,chapter_id" },
  );
  return { ok: !error };
}

export async function toggleBookmark(i: { questionId: string; on: boolean }): Promise<Result> {
  if (!UUID.test(i.questionId)) return { ok: false };
  const { supabase, user } = await authed();
  if (!user) return { ok: false };
  const q = i.on
    ? await supabase.from("bookmarks").upsert({ user_id: user.id, question_id: i.questionId }, { onConflict: "user_id,question_id" })
    : await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("question_id", i.questionId);
  return { ok: !q.error };
}
