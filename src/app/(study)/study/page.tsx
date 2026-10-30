import type { Metadata } from "next";
import Link from "next/link";
import { SubjectPicker } from "./subject-picker";
import {
  attemptSummary, CLASSES, SUBJECTS, pairKey, progressOf, resolveSelection,
  type HubBookRow, type HubProgressRow,
} from "@/features/study/hub";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Study" };

type SearchParams = { searchParams: Promise<{ subject?: string; class?: string }> };
type Row = {
  id: string; slug: string; number: number; title: string; status: string; page_count: number | null; unit_title: string | null;
  books: { class: string; subject: string } | { class: string; subject: string }[] | null;
};
const cta = "inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover";

export default async function StudyHubPage({ searchParams }: SearchParams) {
  const [s, sp] = await Promise.all([getSession(), searchParams]);
  const guest = !s;
  const staff = s?.profile?.role === "admin" || s?.profile?.role === "reviewer";

  const supabase = await createClient();
  // RLS decides visibility for us: students and guests see live chapters only, staff also see drafts.
  const { data } = await supabase
    .from("chapters")
    .select("id, slug, number, title, status, page_count, unit_title, books(class, subject)")
    .order("number");
  const chapters: HubBookRow[] = ((data ?? []) as unknown as Row[]).map((r) => {
    const b = Array.isArray(r.books) ? r.books[0] : r.books;
    return {
      id: r.id, slug: r.slug, number: r.number, title: r.title, status: r.status, page_count: r.page_count,
      unit_title: r.unit_title, bookClass: b?.class ?? "", bookSubject: b?.subject ?? "",
    };
  });

  const counts: Record<string, number> = {};
  for (const c of chapters) counts[pairKey(c.bookSubject, c.bookClass)] = (counts[pairKey(c.bookSubject, c.bookClass)] ?? 0) + 1;
  const content = SUBJECTS.flatMap((sub) => CLASSES.map((cls) => ({ subject: sub, classNo: cls, count: counts[pairKey(sub, cls)] ?? 0 })));
  const sel = resolveSelection({ subject: sp.subject, class: sp.class }, s?.profile?.prefs, content);

  const ids = chapters.map((c) => c.id);
  const qCount = new Map<string, number>();
  const statsByChapter = new Map<string, { attempted: number; correct: number; wrong: number }>();
  const progByChapter = new Map<string, HubProgressRow>();
  if (ids.length > 0) {
    const publishedQuestions = await supabase.from("questions").select("id, chapter_id").in("chapter_id", ids).eq("status", "published");
    const qRows = (publishedQuestions.data ?? []) as { id: string; chapter_id: string }[];
    for (const q of qRows) qCount.set(q.chapter_id, (qCount.get(q.chapter_id) ?? 0) + 1);
    if (!guest) {
      const [prog, att] = await Promise.all([
        supabase.from("reading_progress").select("chapter_id, last_page, pages_seen, updated_at").in("chapter_id", ids).eq("user_id", s.user.id).order("updated_at", { ascending: false }),
        supabase.from("attempts").select("question_id, is_correct, attempt_no").eq("user_id", s.user.id),
      ]);
      for (const p of (prog.data ?? []) as HubProgressRow[]) progByChapter.set(p.chapter_id, p);
      const setByChapter = new Map<string, Set<string>>();
      for (const q of qRows) {
        let set = setByChapter.get(q.chapter_id);
        if (!set) setByChapter.set(q.chapter_id, set = new Set());
        set.add(q.id);
      }
      for (const c of chapters) statsByChapter.set(c.id, attemptSummary((att.data ?? []) as { question_id: string; is_correct: boolean; attempt_no: number }[], setByChapter.get(c.id) ?? new Set()));
    }
  }

  const ordered = [...progByChapter.values()];
  const resume = ordered[0] ? chapters.find((c) => c.id === ordered[0].chapter_id) : undefined;
  const resumeRow = resume ? progByChapter.get(resume.id) : undefined;
  const selected = chapters.filter((c) => c.bookSubject === sel.subject && c.bookClass === sel.classNo);
  const available = content.filter((c) => c.count > 0);
  const resumeProgress = resume && resumeRow ? progressOf({ pageCount: resume.page_count }, resumeRow) : null;
  const shown = selected.map((c) => ({
    c, qCount: qCount.get(c.id) ?? 0,
    progress: progressOf({ pageCount: c.page_count }, progByChapter.get(c.id)),
    stats: statsByChapter.get(c.id) ?? { attempted: 0, correct: 0, wrong: 0 },
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="max-w-prose">
        <h1 className="text-2xl font-semibold text-ink">Study</h1>
        <p className="mt-1 text-sm text-ink-2">Read the NCERT chapter page by page, and practise the expected questions from that exact page.</p>
      </div>

      <div className="mt-4 space-y-4">
        <SubjectPicker subject={sel.subject} classNo={sel.classNo} counts={counts} signedIn={!guest} />

        {guest && (
          <section aria-label="Guest mode" className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="min-w-0 flex-1 text-sm text-ink-2">
              <span className="font-medium text-ink">Guest mode.</span> You can read every page and try the first 2 questions
              on each. Sign in with Google to keep your progress, bookmarks and attempts.
            </p>
            <Link href="/sign-in?next=%2Fstudy" className={cta}>Sign in with Google</Link>
          </section>
        )}

        {!guest && resume && resumeRow && resumeProgress && (
          <section aria-labelledby="continue-h" className="rounded-2xl border border-line bg-surface p-4">
            <h2 id="continue-h" className="text-sm font-semibold text-ink">Continue studying</h2>
            <Link href={`/study/${resume.slug}?p=${resumeRow.last_page}`} className="group mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-canvas p-3 transition-colors hover:bg-surface-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-ink group-hover:text-brand-text">{resume.title} <span className="text-xs text-muted">{resume.bookSubject} · Class {resume.bookClass}</span></p>
                <p className="text-xs text-ink-2">PDF page {resumeRow.last_page} of {resumeProgress.total}</p>
              </div>
              <div className="w-40" role="progressbar" aria-valuenow={resumeProgress.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`read ${resumeProgress.pct}% of the chapter`}>
                <div className="h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${resumeProgress.pct}%` }} /></div>
              </div>
            </Link>
          </section>
        )}

        {!guest && ordered.length > 0 && (
          <section aria-labelledby="recent-h" className="rounded-2xl border border-line bg-surface p-4">
            <h2 id="recent-h" className="text-sm font-semibold text-ink">Recent chapters</h2>
            <ul className="mt-2 divide-y divide-line">
              {ordered.slice(0, 3).map((p) => {
                const ch = chapters.find((c) => c.id === p.chapter_id);
                if (!ch) return null;
                const pr = progressOf({ pageCount: ch.page_count }, p);
                return (
                  <li key={p.chapter_id}>
                    <Link href={`/study/${ch.slug}?p=${p.last_page}`} className="group flex flex-wrap items-center justify-between gap-x-3 py-2">
                      <span className="min-w-0 truncate text-sm text-ink group-hover:text-brand-text">{ch.title}</span>
                      <span className="shrink-0 text-xs text-ink-2">page {p.last_page} of {pr.total} · {pr.pct}%</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-label={`Chapters · ${sel.subject}, Class ${sel.classNo}`}>
          <h2 className="text-sm font-semibold text-ink-2">{sel.subject} · Class {sel.classNo}</h2>
          {shown.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-line bg-surface-2/60 p-8 text-center">
              <h3 className="text-lg font-semibold text-ink">No chapters here yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-2">
                Chapters appear as soon as their content is reviewed and published.{" "}
                {available.length === 0
                  ? "Nothing is published yet."
                  : `Published chapters right now: ${available.map((a) => `${a.subject} · Class ${a.classNo}`).join(", ")}.`}
                {staff ? " Draft chapters you can review still show up below once content starts landing." : ""}
              </p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {shown.map(({ c, qCount: total, progress: pr, stats }) => (
                <Link key={c.slug} href={`/study/${c.slug}`} className="group rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted">Chapter {c.number}{c.unit_title ? ` · ${c.unit_title}` : ""}</p>
                      <h3 className="truncate font-medium text-ink group-hover:text-brand-text">{c.title}</h3>
                    </div>
                    <span className="shrink-0 text-xs text-muted" aria-label={total === 0 ? "no published questions yet" : `${total} published questions`}>{total > 0 ? `${total} Q` : "no Q yet"}</span>
                  </div>
                  {c.status === "draft" && <span className="mt-2 inline-flex rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text">Draft — staff view</span>}
                  {pr.total > 1 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-ink-2"><span>read {pr.seen} of {pr.total} pages</span><span>{pr.pct}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${pr.pct}%` }} /></div>
                    </div>
                  )}
                  {stats.attempted > 0 && <p className="mt-2 text-xs text-ink-2">{stats.attempted} of {total || stats.attempted} answered · {stats.correct} correct</p>}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
