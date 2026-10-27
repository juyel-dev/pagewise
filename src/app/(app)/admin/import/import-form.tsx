"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { importPageFile, type ImportResult } from "@/features/admin/import-actions";
import { validatePageFile } from "@/lib/question-bank/format";

type Item = { name: string; json: unknown; pdfFile: string; page: number; count: number; errors: string[]; warnings: string[]; result?: ImportResult };

export function ImportForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const out: Item[] = [];
    for (const f of [...list].filter((x) => x.name.endsWith(".json"))) {
      try {
        const json = JSON.parse(await f.text());
        const v = validatePageFile(json);
        const src = (json as { source?: { pdf_file?: string; pdf_page?: number } }).source;
        out.push({ name: f.webkitRelativePath || f.name, json, pdfFile: String(src?.pdf_file ?? "?"), page: Number(src?.pdf_page ?? 0),
          count: Array.isArray((json as { questions?: unknown[] }).questions) ? (json as { questions: unknown[] }).questions.length : 0,
          errors: v.ok ? [] : v.errors, warnings: v.ok ? v.warnings : [] });
      } catch { out.push({ name: f.name, json: null, pdfFile: "?", page: 0, count: 0, errors: ["Not valid JSON."], warnings: [] }); }
    }
    out.sort((a, b) => a.pdfFile.localeCompare(b.pdfFile) || a.page - b.page);
    setItems(out);
  }

  async function run() {
    setBusy(true);
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      if (next[i].errors.length || next[i].result?.ok) continue;
      next[i] = { ...next[i], result: await importPageFile(next[i].json) };
      setItems([...next]);
    }
    setBusy(false);
  }

  const valid = items.filter((i) => i.errors.length === 0 && !i.result?.ok);
  const total = valid.reduce((n, i) => n + i.count, 0);
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-ink">Question page files (.json)</span>
        <input type="file" accept=".json,application/json" multiple onChange={(e) => onFiles(e.target.files)}
          className="mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-2" />
      </label>
      {items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs text-muted"><tr><th className="p-2">File</th><th className="p-2">PDF</th><th className="p-2">Page</th><th className="p-2">Questions</th><th className="p-2">Status</th></tr></thead>
              <tbody>{items.map((it, i) => (
                <tr key={i} className="border-t border-line align-top">
                  <td className="p-2 text-xs">{it.name}</td><td className="p-2">{it.pdfFile}</td><td className="p-2">{it.page}</td><td className="p-2">{it.count}</td>
                  <td className="p-2">
                    {it.errors.length > 0 && <ul className="list-disc pl-4 text-bad">{it.errors.slice(0, 4).map((e, j) => <li key={j}>{e}</li>)}</ul>}
                    {it.errors.length === 0 && !it.result && <span className="text-good">Valid</span>}
                    {it.warnings.length > 0 && <p className="text-xs text-accent-text">{it.warnings.length} warning(s)</p>}
                    {it.result && (it.result.ok
                      ? <span className="text-good">Imported: {it.result.inserted} new, {it.result.updated} updated, {it.result.unchanged} unchanged</span>
                      : <ul className="list-disc pl-4 text-bad">{it.result.errors.map((e, j) => <li key={j}>{e}</li>)}</ul>)}
                  </td>
                </tr>))}
              </tbody>
            </table>
          </div>
          <Button onClick={run} disabled={busy || valid.length === 0}>{busy ? "Importing…" : `Import ${total} questions from ${valid.length} file(s)`}</Button>
          <p className="text-xs text-muted">Imported questions are saved as “In review”. Nothing is shown to students until you publish it in Review. Importing the same file again changes only questions whose text changed.</p>
        </>
      )}
    </div>
  );
}
