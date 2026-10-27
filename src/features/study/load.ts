import { getSession } from "@/lib/auth/session";
import type { QuestionPayload, QuestionType } from "@/lib/question-bank/format";
import { createClient } from "@/lib/supabase/server";
import type { PageMapRow, StudyChapter, StudyQuestion } from "./types";

export type StudyData = {
  chapter: StudyChapter; pageMap: PageMapRow[]; pdfUrl: string | null; isAdmin: boolean; review: boolean;
  questionsByPage: Record<string, StudyQuestion[]>; initialPage: number; seenPages: number[]; bookmarkedIds: string[];
};

type QRow = { id: string; pdf_page: number; type: QuestionType; difficulty: StudyQuestion["difficulty"]; status: string; current: { id: string; payload: QuestionPayload } | { id: string; payload: QuestionPayload }[] | null };

export async function loadStudy(slug: string, opts: { p?: string; review: boolean }): Promise<StudyData | null> {
  const s = await getSession();
  if (!s) return null;
  const role = s.profile?.role;
  const staff = role === "admin" || role === "reviewer";
  if (opts.review && !staff) return null;

  const supabase = await createClient();
  const { data: ch } = await supabase.from("chapters").select("id, slug, title, page_count, pdf_path, status, unit_title").eq("slug", slug).maybeSingle();
  if (!ch) return null;

  let qQuery = supabase.from("questions")
    .select("id, pdf_page, type, difficulty, status, current:question_versions!questions_current_version_fk(id, payload)")
    .eq("chapter_id", ch.id).order("pdf_page").order("external_id");
  qQuery = opts.review ? qQuery.neq("status", "retired") : qQuery.eq("status", "published");

  const [pm, prog, bms, qs] = await Promise.all([
    supabase.from("page_map").select("pdf_page, printed_label, kind").eq("chapter_id", ch.id).order("pdf_page"),
    supabase.from("reading_progress").select("last_page, pages_seen").eq("chapter_id", ch.id).eq("user_id", s.user.id).maybeSingle(),
    supabase.from("bookmarks").select("question_id").eq("user_id", s.user.id),
    qQuery,
  ]);

  const questionsByPage: Record<string, StudyQuestion[]> = {};
  for (const r of (qs.data ?? []) as unknown as QRow[]) {
    const cur = Array.isArray(r.current) ? r.current[0] : r.current;
    if (!cur) continue;
    (questionsByPage[String(r.pdf_page)] ??= []).push({ id: r.id, version_id: cur.id, type: r.type, difficulty: r.difficulty, status: r.status, payload: cur.payload });
  }

  let pdfUrl: string | null = null;
  if (ch.pdf_path) {
    const { data } = await supabase.storage.from("chapter-pdfs").createSignedUrl(ch.pdf_path, 3600);
    pdfUrl = data?.signedUrl ?? null;
  }
  const count = ch.page_count ?? Math.max(1, (pm.data ?? []).length);
  const want = Number(opts.p) || prog.data?.last_page || 1;
  return {
    chapter: { id: ch.id, slug: ch.slug, title: ch.title, pageCount: count, status: ch.status, unit: ch.unit_title ?? null },
    pageMap: (pm.data ?? []) as PageMapRow[], pdfUrl, isAdmin: role === "admin", review: opts.review,
    questionsByPage, initialPage: Math.min(Math.max(1, want), count),
    seenPages: prog.data?.pages_seen ?? [], bookmarkedIds: (bms.data ?? []).map((b) => b.question_id as string),
  };
}
