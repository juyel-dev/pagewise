"use server";
import { getSession } from "@/lib/auth/session";
import { toPayload, validatePageFile, type BankQuestion } from "@/lib/question-bank/format";
import { createClient } from "@/lib/supabase/server";

export type ImportResult = { ok: boolean; inserted: number; updated: number; unchanged: number; errors: string[] };

const stable = (v: unknown): string => JSON.stringify(v, (_k, val) =>
  val && typeof val === "object" && !Array.isArray(val) ? Object.fromEntries(Object.entries(val as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : val);

/** Admin only. Imports one page file. New questions land in `in_review`; edited ones get a new version and go back to review. */
export async function importPageFile(json: unknown): Promise<ImportResult> {
  const fail = (...errors: string[]): ImportResult => ({ ok: false, inserted: 0, updated: 0, unchanged: 0, errors });
  const s = await getSession();
  if (!s || s.profile?.role !== "admin") return fail("Only admins can import questions.");
  const v = validatePageFile(json);
  if (!v.ok) return fail(...v.errors.slice(0, 20));

  const { file } = v;
  const pdfFile = file.source.pdf_file.replace(/\.pdf$/i, "");
  const supabase = await createClient();
  const { data: chapter } = await supabase.from("chapters").select("id").eq("pdf_file", pdfFile).maybeSingle();
  if (!chapter) return fail(`No chapter is set up for ${pdfFile}. Add the chapter first.`);

  const ids = file.questions.map((q) => q.id);
  const { data: existing, error: e1 } = await supabase.from("questions").select("id, external_id, current_version_id, status").in("external_id", ids);
  if (e1) return fail("Could not read existing questions.");
  const byExt = new Map((existing ?? []).map((r) => [r.external_id as string, r]));
  const existingIds = (existing ?? []).map((r) => r.id as string);
  const { data: vers } = existingIds.length
    ? await supabase.from("question_versions").select("id, question_id, version, payload").in("question_id", existingIds)
    : { data: [] as { id: string; question_id: string; version: number; payload: unknown }[] };
  const maxVer = new Map<string, number>(); const curPayload = new Map<string, unknown>();
  for (const x of vers ?? []) { maxVer.set(x.question_id, Math.max(maxVer.get(x.question_id) ?? 0, x.version)); }
  for (const r of existing ?? []) curPayload.set(r.id as string, (vers ?? []).find((x) => x.id === r.current_version_id)?.payload);

  const pg = file.source.pdf_page;
  const note = `${pdfFile}.pdf, PDF page ${pg}`;
  let inserted = 0, updated = 0, unchanged = 0;
  const newQ: { id: string; ext: string; q: BankQuestion }[] = [];
  const changed: { qid: string; q: BankQuestion; version: number }[] = [];

  for (const q of file.questions) {
    const row = byExt.get(q.id);
    if (!row) { newQ.push({ id: crypto.randomUUID(), ext: q.id, q }); continue; }
    if (stable(curPayload.get(row.id as string)) === stable(toPayload(q))) { unchanged++; continue; }
    changed.push({ qid: row.id as string, q, version: (maxVer.get(row.id as string) ?? 0) + 1 });
  }

  if (newQ.length) {
    const vIds = new Map(newQ.map((n) => [n.id, crypto.randomUUID()]));
    const r1 = await supabase.from("questions").insert(newQ.map((n) => ({
      id: n.id, chapter_id: chapter.id, pdf_page: pg, type: n.q.type, difficulty: n.q.difficulty, topic: n.q.topic, external_id: n.ext, status: "in_review",
    })));
    if (r1.error) return fail("Could not save new questions: " + r1.error.message);
    const r2 = await supabase.from("question_versions").insert(newQ.map((n) => ({
      id: vIds.get(n.id), question_id: n.id, lang: "en", version: 1, payload: toPayload(n.q), source_note: note, created_by: s.user.id,
    })));
    if (r2.error) return fail("Could not save question text: " + r2.error.message);
    const r3 = await Promise.all(newQ.map((n) => supabase.from("questions").update({ current_version_id: vIds.get(n.id) }).eq("id", n.id)));
    if (r3.some((x) => x.error)) return fail("Could not link question versions.");
    inserted = newQ.length;
  }

  for (const c of changed) {
    const vid = crypto.randomUUID();
    const r = await supabase.from("question_versions").insert({ id: vid, question_id: c.qid, lang: "en", version: c.version, payload: toPayload(c.q), source_note: note, created_by: s.user.id });
    if (r.error) return fail("Could not save an edited question: " + r.error.message);
    const u = await supabase.from("questions").update({ current_version_id: vid, type: c.q.type, difficulty: c.q.difficulty, topic: c.q.topic, status: "in_review" }).eq("id", c.qid);
    if (u.error) return fail("Could not update an edited question.");
    updated++;
  }

  await supabase.rpc("write_audit", { p_action: "import_page", p_entity: "question_page", p_entity_id: `${pdfFile} p${pg}`, p_before: null, p_after: { inserted, updated, unchanged } });
  return { ok: true, inserted, updated, unchanged, errors: [] };
}
