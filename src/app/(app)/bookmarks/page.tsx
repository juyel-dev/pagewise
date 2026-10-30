import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Bookmarks" };

type Row = {
  question_id: string; created_at: string;
  questions: {
    pdf_page: number;
    chapters: { slug: string; title: string } | { slug: string; title: string }[] | null;
    current: { payload: { question: string } } | { payload: { question: string } }[] | null;
  } | null;
};
type Item = { id: string; page: number; chapter: { slug: string; title: string } | null; stem: string; at: string };

/** Real bookmark list (question → chapter + PDF page); removing stays in the workspace for now. */
export default async function BookmarksPage() {
  const s = await getSession();
  const supabase = await createClient();
  let items: Item[] = [];
  if (s) {
    const { data } = await supabase
      .from("bookmarks")
      .select("question_id, created_at, questions(pdf_page, chapters(slug, title), current:question_versions!questions_current_version_fk(payload))")
      .eq("user_id", s.user.id)
      .order("created_at", { ascending: false });
    items = ((data ?? []) as unknown as Row[]).map((r) => {
      const qs = r.questions;
      const ch = Array.isArray(qs?.chapters) ? qs.chapters[0] : qs?.chapters;
      const cur = Array.isArray(qs?.current) ? qs.current[0] : qs?.current;
      return { id: r.question_id, at: r.created_at, page: qs?.pdf_page ?? 1, chapter: ch ?? null, stem: cur?.payload.question ?? "" };
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Bookmarks</h1>
        <p className="mt-1 max-w-prose text-sm text-ink-2">
          Questions you saved while practising. Open the exact PDF page they belong to; the question waits there for you.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-2">
          Nothing saved yet{s ? "" : " — sign in to keep bookmarks"}. Bookmark questions in the chapter workspace and they collect here.
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((r) => (
            <li key={r.id}>
              <Link href={r.chapter ? `/study/${r.chapter.slug}?p=${r.page}` : "/study"}
                className="group block rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-text"><Bookmark className="size-4" /></span>
                  <p className="min-w-0 flex-1 text-sm font-medium text-ink group-hover:text-brand-text">{r.stem}</p>
                  <span className="shrink-0 text-xs text-muted">{r.chapter?.title ?? "Chapter"} · page {r.page}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
