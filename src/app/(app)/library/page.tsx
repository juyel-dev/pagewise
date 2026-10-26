import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Library" };

type Row = { id: string; slug: string; status: string; number: number; title: string; page_count: number | null; books: { class: string; subject: string } | { class: string; subject: string }[] | null };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id, slug, status, number, title, page_count, books(class, subject)")
    .order("number");
  const rows = ((data ?? []) as Row[]).map((r) => ({ ...r, book: Array.isArray(r.books) ? r.books[0] : r.books }));
  const groups = (["11", "12"] as const).map((c) => ({ cls: c, items: rows.filter((r) => r.book?.class === c) }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Library</h1>
        <p className="mt-1 text-sm text-ink-2">Biology, NCERT Class 11 and 12.</p>
      </div>
      {error && <p role="alert" className="text-sm text-bad">We could not load the library. Please refresh.</p>}
      {!error && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">Chapters are on the way</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">Every question is reviewed before it goes live, so the first chapters are published only when they pass review.</p>
        </div>
      )}
      {groups.filter((g) => g.items.length > 0).map((g) => (
        <section key={g.cls} aria-label={`Class ${g.cls}`}>
          <h2 className="mb-3 text-lg font-semibold text-ink">Class {g.cls}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((c) => (
              <li key={c.id}>
                <Link href={`/study/${c.slug}`} className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                  <p className="text-xs text-muted">Chapter {c.number}{c.status === "draft" ? " · Draft (staff only)" : ""}</p>
                  <p className="mt-1 font-medium text-ink">{c.title}</p>
                  {c.page_count ? <p className="mt-2 text-xs text-muted">{c.page_count} pages</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
