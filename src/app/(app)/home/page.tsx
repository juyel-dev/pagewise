import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Atom, BarChart3, BookOpen, Bookmark, FlaskConical, Leaf, Target, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { progressOf, type HubProgressRow } from "@/features/study/hub";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Home" };

const card = "rounded-2xl border border-line bg-surface shadow-sm";
const sectionHead = "flex items-center justify-between gap-2";

type ChapterRow = {
  id: string; slug: string; number: number; title: string; page_count: number | null;
  books: { class: string; subject: string } | { class: string; subject: string }[] | null;
};
type StatsRow = { day: string; answered: number; correct: number };

const SUBJECT_META: Record<string, { icon: LucideIcon; tile: string }> = {
  Biology: { icon: Leaf, tile: "bg-good-soft text-good" },
  Physics: { icon: Atom, tile: "bg-accent-soft text-accent" },
  Chemistry: { icon: FlaskConical, tile: "bg-brand-soft text-brand-text" },
};
const subjectMeta = (subject: string) => SUBJECT_META[subject] ?? { icon: BookOpen, tile: "bg-brand-soft text-brand-text" };

/** Server-rendered, deterministic per request (for Bangladesh = Asia/Dhaka). */
function daypart(): "morning" | "afternoon" | "evening" {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }).format(new Date()));
  return h >= 5 && h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}
function relTime(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(Date.parse(iso));
}
function todayIn(dhaka: StatsRow[]): StatsRow | undefined {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date()); // YYYY-MM-DD
  return dhaka.find((r) => r.day === day);
}

function Bar({ pct, className = "" }: { pct: number; className?: string }) {
  return <div aria-hidden className={cn("h-1.5 rounded-full bg-line", className)}><div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>;
}
function Ring({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 38;
  return (
    <svg viewBox="0 0 96 96" className="size-24" role="img" aria-label={`${pct}% complete`}>
      <circle cx="48" cy="48" r="38" fill="none" stroke="var(--line)" strokeWidth="9" />
      <circle cx="48" cy="48" r="38" fill="none" stroke="var(--brand)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 48 48)" />
      <text x="48" y="54" textAnchor="middle" className="fill-ink text-lg font-semibold">{pct}%</text>
    </svg>
  );
}
function Tile({ icon: Icon, tint, label, value }: { icon: LucideIcon; tint: string; label: string; value: string }) {
  return (
    <div className={cn(card, "p-4")}>
      <span aria-hidden className={cn("grid size-9 place-items-center rounded-xl", tint)}><Icon className="size-5" /></span>
      <p className="mt-3 text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ResumeCard({ ch, row, pct, meta }: {
  ch: { slug: string; number: number; title: string; bookClass: string; bookSubject: string };
  row: { last_page: number | null; updated_at: string };
  pct: { pct: number };
  meta: { icon: LucideIcon; tile: string };
}) {
  const Icon = meta.icon;
  const href = `/study/${ch.slug}${row.last_page && row.last_page > 0 ? `?p=${row.last_page}` : ""}`;
  return (
    <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
      <div className="flex flex-wrap items-start gap-4">
        <span aria-hidden className={cn("grid size-16 shrink-0 place-items-center rounded-xl", meta.tile)}><Icon className="size-8" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{ch.bookSubject} · Class {ch.bookClass} · Chapter {ch.number}</p>
          <p className="truncate text-sm font-semibold text-ink">{ch.title}</p>
        </div>
        <span className="text-xs text-ink-2">{pct.pct}% completed</span>
      </div>
      <Bar pct={pct.pct} className="mt-3" />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <ButtonLink href={href}>Continue Reading</ButtonLink>
        <ButtonLink href={href} variant="secondary">View Questions</ButtonLink>
        <p className="ml-auto text-xs text-muted">Last studied: {relTime(row.updated_at)} · Page {row.last_page}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const s = await getSession();

  if (!s) {
    // Guests keep the honest no-account home (decisions 28–29) inside the new shell.
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome to {brand.name}</h1>
          <p className="mt-1 max-w-prose text-sm text-ink-2">Read the NCERT page and practise exam-style questions from that exact page. You are browsing as a guest — nothing is saved yet.</p>
        </div>
        <section aria-label="Get started" className={cn(card, "p-6")}>
          <h2 className="text-lg font-semibold text-ink">Two ways to start</h2>
          <ul className="mt-2 max-w-prose space-y-1.5 text-sm text-ink-2">
            <li>Keep exploring as a guest: read every page, try the first 2 questions on each.</li>
            <li>Sign in with Google when you want bookmarks, reading progress and attempts saved.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/sign-in?next=%2Fhome">Sign in with Google</ButtonLink>
            <ButtonLink href="/study" variant="secondary">Start studying</ButtonLink>
          </div>
        </section>
      </div>
    );
  }

  const supabase = await createClient();
  const [chaptersRes, progRes, statsRes] = await Promise.all([
    supabase.from("chapters").select("id, slug, number, title, page_count, books(class, subject)").eq("status", "live").order("number"),
    supabase.from("reading_progress").select("chapter_id, last_page, pages_seen, updated_at").eq("user_id", s.user.id).order("updated_at", { ascending: false }),
    supabase.from("daily_stats").select("day, answered, correct").order("day", { ascending: false }),
  ]);

  const chapters = ((chaptersRes.data ?? []) as unknown as ChapterRow[]).map((r) => {
    const b = Array.isArray(r.books) ? r.books[0] : r.books;
    return { ...r, bookClass: b?.class ?? "", bookSubject: b?.subject ?? "" };
  });
  const rows = (progRes.data ?? []) as HubProgressRow[];
  const stats = (statsRes.data ?? []) as StatsRow[];

  const totalChapters = chapters.length;
  const totalPages = chapters.reduce((n, c) => n + (c.page_count ?? 0), 0);
  const pagesSeen = new Set<number>();
  for (const r of rows) for (const p of r.pages_seen ?? []) if (p > 0) pagesSeen.add(p);
  const attempted = stats.reduce((n, r) => n + r.answered, 0);
  const correctCount = stats.reduce((n, r) => n + r.correct, 0);
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : null;

  const resume = rows[0];
  const resumeCh = resume?.chapter_id ? chapters.find((c) => c.id === resume.chapter_id) : undefined;
  const recent = rows.slice(0, 3);
  const chaptersStarted = new Set(rows.map((r) => r.chapter_id)).size;
  const overallPct = totalPages > 0 ? Math.min(100, Math.round((pagesSeen.size / totalPages) * 100)) : 0;

  const today = todayIn(stats);
  const goal = s.profile?.daily_goal ?? 20;
  const answeredToday = Math.min(today?.answered ?? 0, goal);
  const goalRemaining = Math.max(0, goal - answeredToday);
  const hrefOf = (slug: string, page?: number | null) => `/study/${slug}${page && page > 0 ? `?p=${page}` : ""}`;
  const firstName = (s.profile?.display_name || "there").split(" ")[0];
  const resumePct = resume && resumeCh ? progressOf({ pageCount: resumeCh.page_count }, resume) : null;
  const resumeSubj = resumeCh ? subjectMeta(resumeCh.bookSubject) : null;

  const quickActions = [
    { icon: BookOpen, title: "Browse Chapters", sub: "Explore all chapters", href: "/study" },
    { icon: Target, title: "Practice Questions", sub: "Page-wise MCQs", href: "/study" },
    { icon: BarChart3, title: "View Progress", sub: "Your learning stats", href: "/progress" },
    { icon: Bookmark, title: "Manage Bookmarks", sub: "Saved questions", href: "/bookmarks" },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Good {daypart()}, {firstName}! <span aria-hidden>👋</span></h1>
          <p className="mt-1 text-sm text-ink-2">Keep going! Your efforts are getting you closer to your dream.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile icon={BookOpen} tint="bg-brand-soft text-brand-text" label="Total Chapters" value={String(totalChapters)} />
          <Tile icon={BookOpen} tint="bg-good-soft text-good" label="Pages Studied" value={totalPages > 0 ? `${pagesSeen.size} / ${totalPages}` : "0"} />
          <Tile icon={Target} tint="bg-accent-soft text-accent" label="Questions Attempted" value={String(attempted)} />
          <Tile icon={BarChart3} tint="bg-accent-soft text-accent" label="Accuracy" value={accuracy === null ? "—" : `${accuracy}%`} />
        </div>

        <section aria-labelledby="resume-h" className={cn(card, "p-5")}>
          <div className={sectionHead}>
            <h2 id="resume-h" className="text-base font-semibold text-ink">Continue Studying</h2>
            <Link href="/study" className="text-sm text-brand-text hover:underline">View all <ArrowRight className="inline size-3.5" aria-hidden /></Link>
          </div>
          {resume && resumeCh && resumePct && resumeSubj ? (
            <ResumeCard ch={resumeCh} row={resume} pct={resumePct} meta={resumeSubj} />
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas p-6 text-center">
              <p className="text-sm text-ink-2">You have not started a chapter yet. Open your first chapter to begin.</p>
              <ButtonLink href="/study" className="mt-3">Go to Study</ButtonLink>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-h" className={cn(card, "p-5")}>
          <div className={sectionHead}>
            <h2 id="recent-h" className="text-base font-semibold text-ink">Recent Chapters</h2>
            <Link href="/study" className="text-sm text-brand-text hover:underline">View all <ArrowRight className="inline size-3.5" aria-hidden /></Link>
          </div>
          {recent.length > 0 ? (
            <ul className="mt-2 divide-y divide-line">
              {recent.map((r) => {
                const ch = chapters.find((c) => c.id === r.chapter_id);
                if (!ch) return null;
                const pr = progressOf({ pageCount: ch.page_count }, r);
                const meta = subjectMeta(ch.bookSubject);
                const Icon = meta.icon;
                return (
                  <li key={r.chapter_id}>
                    <Link href={hrefOf(ch.slug, r.last_page)} className="group flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                      <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center rounded-xl", meta.tile)}><Icon className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink group-hover:text-brand-text">{ch.title}</p>
                        <p className="text-xs text-muted">{ch.bookSubject} · Class {ch.bookClass} · Chapter {ch.number}</p>
                      </div>
                      <Bar pct={pr.pct} className="w-32 shrink-0" />
                      <span className="w-10 text-right text-xs text-ink-2">{pr.pct}%</span>
                      <span className="w-24 shrink-0 text-right text-xs text-muted">Last studied: {relTime(r.updated_at)}</span>
                      <span className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors group-hover:bg-brand-hover">Continue</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-2">No chapters read yet. Recent reading shows up here.</p>
          )}
        </section>
      </div>

      <div className="space-y-4">
        <section aria-labelledby="qa-h" className={cn(card, "p-5")}>
          <h2 id="qa-h" className="text-base font-semibold text-ink">Quick Actions</h2>
          <div className="mt-3 space-y-2.5">
            {quickActions.map((a) => (
              <Link key={a.title + a.href} href={a.href} className="group flex items-center gap-3 rounded-xl border border-line bg-canvas p-3 transition-colors hover:bg-surface-2">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text"><a.icon className="size-[1.15rem]" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink group-hover:text-brand-text">{a.title}</p>
                  <p className="truncate text-xs text-muted">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="overall-h" className={cn(card, "flex items-center gap-4 p-5")}>
          <Ring pct={overallPct} />
          <div className="min-w-0">
            <h2 id="overall-h" className="text-base font-semibold text-ink">Overall Completion</h2>
            <p className="text-xs text-ink-2">{chaptersStarted} of {totalChapters} chapters</p>
            {totalPages === 0 && <p className="text-xs text-muted">No pages to read yet.</p>}
          </div>
        </section>

        <section aria-labelledby="goal-h" className={cn(card, "p-5")}>
          <h2 id="goal-h" className="text-base font-semibold text-ink">Today&apos;s Goal</h2>
          <p className="mt-1 text-sm font-medium text-ink">{goalRemaining > 0 ? `${goalRemaining} question${goalRemaining === 1 ? "" : "s"} to go` : "Daily goal complete — brilliant!"}</p>
          <p className="text-xs text-muted">{answeredToday} of {goal} answered today</p>
          <div aria-hidden className="mt-3"><Bar pct={Math.min(100, Math.round((answeredToday / Math.max(goal, 1)) * 100))} /></div>
        </section>

        <section aria-label="Quote" className={cn(card, "p-5")}>
          <blockquote className="text-sm leading-6 text-ink-2">
            <p>&ldquo;Discipline today builds the success of tomorrow.&rdquo;</p>
            <footer className="mt-2 text-xs text-muted">— {brand.name}</footer>
          </blockquote>
        </section>
      </div>
    </div>
  );
}
