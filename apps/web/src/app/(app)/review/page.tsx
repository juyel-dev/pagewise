import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Review", robots: { index: false } };

export default async function ReviewIndex() {
  const s = await getSession();
  const role = s?.profile?.role;
  if (role !== "admin" && role !== "reviewer") notFound();
  const supabase = await createClient();
  const [{ data: chapters }, { data: qs }] = await Promise.all([
    supabase.from("chapters").select("id, slug, title, number, unit_number, status, books(class)").order("number"),
    supabase.from("questions").select("chapter_id, status"),
  ]);
  const counts = new Map<string, Record<string, number>>();
  for (const q of qs ?? []) { const c = counts.get(q.chapter_id as string) ?? {}; c[q.status as string] = (c[q.status as string] ?? 0) + 1; counts.set(q.chapter_id as string, c); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Review</h1>
        {role === "admin" && <Link href="/admin/import" className="text-sm font-medium text-brand-text underline">Import questions</Link>}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {(chapters ?? []).map((c) => {
          const k = counts.get(c.id as string) ?? {};
          const total = Object.values(k).reduce((a, b) => a + b, 0);
          const cls = Array.isArray(c.books) ? c.books[0]?.class : (c.books as { class?: string } | null)?.class;
          return (
            <li key={c.id as string}>
              <Link href={`/review/${c.slug}`} className="block rounded-2xl border border-line bg-surface p-4 hover:bg-surface-2">
                <p className="text-xs text-muted">Class {cls} · Chapter {c.number} · {c.status === "live" ? "Live" : "Draft"}</p>
                <p className="mt-1 font-medium text-ink">{c.title as string}</p>
                <p className="mt-2 text-xs text-ink-2">{total === 0 ? "No questions yet" : `${k.in_review ?? 0} in review · ${k.published ?? 0} published · ${total} total`}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
