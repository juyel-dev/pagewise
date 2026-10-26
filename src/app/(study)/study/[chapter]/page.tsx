import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyWorkspace } from "@/features/study/study-workspace";
import type { PageMapRow } from "@/features/study/types";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Study", robots: { index: false } };

type Params = { params: Promise<{ chapter: string }>; searchParams: Promise<{ p?: string }> };

export default async function StudyPage({ params, searchParams }: Params) {
  const [{ chapter: slug }, { p }] = await Promise.all([params, searchParams]);
  const s = await getSession();
  const supabase = await createClient();
  const { data: ch } = await supabase.from("chapters").select("id, slug, title, page_count, pdf_path, status").eq("slug", slug).maybeSingle();
  if (!ch || !s) notFound();

  const [pm, prog, bms] = await Promise.all([
    supabase.from("page_map").select("pdf_page, printed_label, kind").eq("chapter_id", ch.id).order("pdf_page"),
    supabase.from("reading_progress").select("last_page, pages_seen").eq("chapter_id", ch.id).eq("user_id", s.user.id).maybeSingle(),
    supabase.from("bookmarks").select("question_id").eq("user_id", s.user.id),
  ]);

  let pdfUrl: string | null = null;
  if (ch.pdf_path) {
    const { data } = await supabase.storage.from("chapter-pdfs").createSignedUrl(ch.pdf_path, 3600);
    pdfUrl = data?.signedUrl ?? null;
  }

  const count = ch.page_count ?? 1;
  const want = Number(p) || prog.data?.last_page || 1;
  return (
    <StudyWorkspace
      chapter={{ id: ch.id, slug: ch.slug, title: ch.title, pageCount: count, status: ch.status }}
      pageMap={(pm.data ?? []) as PageMapRow[]}
      pdfUrl={pdfUrl}
      isAdmin={s.profile?.role === "admin"}
      initialPage={Math.min(Math.max(1, want), count)}
      seenPages={prog.data?.pages_seen ?? []}
      bookmarkedIds={(bms.data ?? []).map((b) => b.question_id as string)}
    />
  );
}
