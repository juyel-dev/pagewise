import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Practice" };

/** Page-wise MCQs live inside the chapter workspace today; chapter-level tests are a later screen. */
export default async function PracticePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chapters")
    .select("slug, number, title, books(class, subject)")
    .eq("status", "live")
    .order("number");
  const chapters = (data ?? []) as unknown as { slug: string; number: number; title: string; books: { class: string; subject: string } | null }[];
  const bookOf = (r: (typeof chapters)[number]) => (Array.isArray(r.books) ? r.books[0] : r.books);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Practice</h1>
        <p className="mt-1 max-w-prose text-sm text-ink-2">
          Questions are tied to PDF pages — open a chapter and press <strong className="text-ink">Practice this page</strong> on the page you are
          reading. Chapter-level tests are planned as a separate screen; they will appear here.
        </p>
      </div>
      {chapters.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-2">No published chapters yet — practice opens with the first chapter.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {chapters.map((r) => (
            <li key={r.slug}>
              <Link href={`/study/${r.slug}`} className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                <p className="text-xs text-muted">{bookOf(r)?.subject ?? ""} · Class {bookOf(r)?.class ?? ""} · Chapter {r.number}</p>
                <p className="mt-0.5 font-medium text-ink hover:text-brand-text">{r.title}</p>
                <p className="mt-1 text-xs text-brand-text">Practice this chapter&apos;s pages →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
