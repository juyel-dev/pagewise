import { getSession } from "@/lib/auth/session";
import type { QuestionPayload, QuestionType } from "@/lib/question-bank/format";
import { createClient } from "@/lib/supabase/server";
import type { PageMapRow, StudyChapter, StudyQuestion } from "./types";

/** Guests see only this many questions per page (decision 29). */
const GUEST_LIMIT = 2;

export type StudyData = {
  chapter: StudyChapter; pageMap: PageMapRow[]; pdfUrl: string | null; isAdmin: boolean; review: boolean;
  questionsByPage: Record<string, StudyQuestion[]>; pageTotal: Record<string, number>;
  initialPage: number; seenPages: number[]; bookmarkedIds: string[];
  guest: boolean;
};

type QRow = { id: string; pdf_page: number; type: QuestionType; difficulty: StudyQuestion["difficulty"]; status: string; current: { id: string; payload: QuestionPayload } | { id: string; payload: QuestionPayload }[] | null };

export async function loadStudy(slug: string, opts: { p?: string; review: boolean }): Promise<StudyData | null> {
  const s = await getSession(); // null = guest; guests read published content (decisions 28–29)
  const role = s?.profile?.role;
  const staff = role === "admin" || role === "reviewer";
  if (opts.review && !staff) return null;
  const guest = !s;

  const supabase = await createClient();
  const { data: ch } = await supabase.from("chapters").select("id, slug, title, page_count, pdf_path, pdf_sha256, status, unit_title").eq("slug", slug).maybeSingle();
  if (!ch) return null;

  const qBase = supabase.from("questions")
    .select("id, pdf_page, type, difficulty, status, current:question_versions!questions_current_version_fk(id, payload)")
    .eq("chapter_id", ch.id).order("pdf_page").order("external_id");
  const qQuery = opts.review ? qBase.neq("status", "retired") : qBase.eq("status", "published");

  const [pm, qs] = await Promise.all([
    supabase.from("page_map").select("pdf_page, printed_label, kind").eq("chapter_id", ch.id).order("pdf_page"),
    qQuery,
  ]);

  // Group per page before limiting. pageTotal keeps the full count so the UI can show an
  // honest "N more after sign-in" chip for guests (locked rows are never sent to them).
  const grouped: Record<string, StudyQuestion[]> = {};
  const pageTotal: Record<string, number> = {};
  for (const r of (qs.data ?? []) as unknown as QRow[]) {
    const cur = Array.isArray(r.current) ? r.current[0] : r.current;
    if (!cur) continue;
    (grouped[String(r.pdf_page)] ??= []).push({ id: r.id, version_id: cur.id, type: r.type, difficulty: r.difficulty, status: r.status, payload: cur.payload });
  }
  for (const [p, list] of Object.entries(grouped)) {
    pageTotal[p] = list.length;
    if (guest && list.length > GUEST_LIMIT) grouped[p] = list.slice(0, GUEST_LIMIT);
  }

  let prog: { data: { last_page: number | null; pages_seen: number[] | null } | null } = { data: null };
  let bms: { data: { question_id: string }[] | null } = { data: null };
  if (s) {
    [prog, bms] = await Promise.all([
      supabase.from("reading_progress").select("last_page, pages_seen").eq("chapter_id", ch.id).eq("user_id", s.user.id).maybeSingle(),
      supabase.from("bookmarks").select("question_id").eq("user_id", s.user.id),
    ]);
  }

  let pdfUrl: string | null = null;
  if (ch.pdf_path) {
    const { data } = await supabase.storage.from("chapter-pdfs").createSignedUrl(ch.pdf_path, 3600);
    pdfUrl = data?.signedUrl ?? null;
  }
  const count = ch.page_count ?? Math.max(1, (pm.data ?? []).length);
  const want = Number(opts.p) || prog.data?.last_page || 1;

  return {
    chapter: { id: ch.id, slug: ch.slug, title: ch.title, pageCount: count, status: ch.status, unit: ch.unit_title ?? null, pdfSha256: ch.pdf_sha256 ?? null },
    pageMap: (pm.data ?? []) as PageMapRow[], pdfUrl, isAdmin: role === "admin", review: opts.review,
    questionsByPage: grouped, pageTotal,
    initialPage: Math.min(Math.max(1, want), count),
    seenPages: prog.data?.pages_seen ?? [], bookmarkedIds: (bms.data ?? []).map((b) => b.question_id as string),
    guest,
  };
}
