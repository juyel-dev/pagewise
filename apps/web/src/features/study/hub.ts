/**
 * Study hub helpers (approved Study spec v1.0, blueprint/12 §2–4).
 * Pure logic only — no server/client imports — so the hub page and tests share exactly this.
 */

export const SUBJECTS = ["Biology", "Physics", "Chemistry"] as const;
export type Subject = (typeof SUBJECTS)[number];
export const CLASSES = ["11", "12"] as const;
export type ClassNo = (typeof CLASSES)[number];

/** What a saved user preference looks like inside profiles.prefs (decision 36). */
export type StudyPrefs = { study_subject?: string; study_class?: string } | null | undefined;

export type HubBookRow = { id: string; slug: string; number: number; title: string; status: string; page_count: number | null; unit_title: string | null; bookClass: string; bookSubject: string };
export type HubProgressRow = { chapter_id: string; last_page: number | null; pages_seen: number[] | null; updated_at: string };

export const pairKey = (s: string, c: string): string => `${s}|${c}`;

/** Select an (subject, class) pair from the URL, then saved prefs, then any pair with content. */
export function resolveSelection(
  raw: { subject?: string; class?: string },
  prefs: StudyPrefs,
  content: { subject: string; classNo: string; count: number }[],
): { subject: string; classNo: string; explicit: boolean } {
  const sub = SUBJECTS.find((s) => s.toLowerCase() === (raw.subject ?? "").toLowerCase());
  const cls = CLASSES.find((c) => c === raw.class);
  const pSub = SUBJECTS.find((s) => s.toLowerCase() === (prefs?.study_subject ?? "").toLowerCase());
  const pCls = CLASSES.find((c) => c === prefs?.study_class);

  const firstWithContent = (s?: string) => {
    for (const c of CLASSES) {
      const hit = content.find((x) => x.subject === (s ?? x.subject) && x.classNo === c && x.count > 0);
      if (hit) return { subject: hit.subject, classNo: hit.classNo };
    }
    return null;
  };

  if (sub) {
    // user asked for a subject explicitly: keep the requested pair even when empty (honest empty state)
    const classNo = cls ?? pCls ?? (content.find((x) => x.subject === sub && x.count > 0)?.classNo ?? "11");
    return { subject: sub, classNo, explicit: true };
  }
  if (cls) {
    const subject = pSub ?? content.find((x) => x.count > 0)?.subject ?? SUBJECTS[0];
    return { subject, classNo: cls, explicit: true };
  }
  if (pSub) {
    const classNo = pCls ?? content.find((x) => x.subject === pSub && x.count > 0)?.classNo ?? "11";
    return { subject: pSub, classNo, explicit: false };
  }
  const fallback = firstWithContent() ?? { subject: SUBJECTS[0] as string, classNo: "11" as string };
  return { subject: fallback.subject, classNo: fallback.classNo, explicit: false };
}

/** Chapters seen vs total pages. */
export function progressOf(ch: { pageCount: number | null }, p: HubProgressRow | undefined): { seen: number; total: number; pct: number } {
  const seen = [...new Set(p?.pages_seen ?? [])].length;
  const total = Math.max(ch.pageCount ?? 0, seen, p?.last_page ?? 0, 1);
  const pct = Math.min(100, Math.round((seen / total) * 100));
  return { seen, total, pct };
}

/** Latest attempt (highest attempt_no) decides correctness; attempted = questions with at least one attempt. */
export function attemptSummary(
  attempts: { question_id: string; is_correct: boolean; attempt_no: number }[],
  questionsIn: Set<string>,
): { attempted: number; correct: number; wrong: number } {
  const latest = new Map<string, { correct: boolean; no: number }>();
  for (const a of attempts) {
    if (!questionsIn.has(a.question_id)) continue;
    const cur = latest.get(a.question_id);
    if (!cur || a.attempt_no >= cur.no) latest.set(a.question_id, { correct: a.is_correct, no: a.attempt_no });
  }
  let correct = 0;
  let wrong = 0;
  for (const v of latest.values()) {
    if (v.correct) correct++;
    else wrong++;
  }
  return { attempted: latest.size, correct, wrong };
}
