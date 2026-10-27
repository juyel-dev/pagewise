"use server";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type SetStatusResult = { ok: boolean; changed?: number; error?: string };

/** Reviewer/admin only (also enforced by RLS). Publishing makes a question visible to students of live chapters. */
export async function setQuestionStatus(i: { ids: string[]; status: "published" | "in_review" | "retired" }): Promise<SetStatusResult> {
  const s = await getSession();
  if (!s || (s.profile?.role !== "admin" && s.profile?.role !== "reviewer")) return { ok: false, error: "Not allowed." };
  if (!["published", "in_review", "retired"].includes(i.status)) return { ok: false, error: "Bad status." };
  const ids = [...new Set(i.ids)].filter((x) => UUID.test(x)).slice(0, 200);
  if (ids.length === 0) return { ok: false, error: "No questions." };

  const supabase = await createClient();
  const { data: rows, error: e1 } = await supabase.from("questions").select("id, status, current_version_id").in("id", ids);
  if (e1 || !rows) return { ok: false, error: "Could not read questions." };
  const targets = rows.filter((r) => r.current_version_id && r.status !== i.status);
  if (targets.length === 0) return { ok: true, changed: 0 };

  const { error: e2 } = await supabase.from("questions").update({ status: i.status }).in("id", targets.map((r) => r.id));
  if (e2) return { ok: false, error: "Could not update." };

  const decision = i.status === "published" ? "approved" : "rejected";
  await supabase.from("reviews").insert(targets.map((r) => ({
    question_version_id: r.current_version_id, reviewer_id: s.user.id, decision, reason: i.status === "retired" ? "retired" : null,
  })));
  await supabase.rpc("write_audit", { p_action: `question_${i.status}`, p_entity: "question", p_entity_id: targets.length === 1 ? targets[0].id : `${targets.length} questions`, p_before: null, p_after: { ids: targets.map((r) => r.id), status: i.status } });
  return { ok: true, changed: targets.length };
}
