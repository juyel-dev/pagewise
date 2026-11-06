import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Import questions", robots: { index: false } };

export default async function ImportPage() {
  const s = await getSession();
  if (s?.profile?.role !== "admin") notFound();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Import questions</h1>
      <p className="text-sm text-ink-2">Select the page files from your question bank (for example every <code>pdf-page-NNN.json</code> of a chapter). Each file is checked before anything is saved.</p>
      <ImportForm />
    </div>
  );
}
