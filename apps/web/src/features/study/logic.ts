/**
 * Pure rules of the Study workspace (docs/spec/screens/S05-study-workspace.md). No React, no I/O,
 * so every rule here is unit-tested and the UI stays thin.
 */
import { isCorrect } from "@pagewise/question-schema";
import type { QState, StudyQuestion } from "./types";

export type QuestionsByPage = Record<string, StudyQuestion[]>;
export type StateMap = Record<string, QState | undefined>;

// ---------- pages ----------

export function clampPage(page: number, pageCount: number): number {
  const max = Math.max(1, Math.floor(pageCount) || 1);
  if (!Number.isFinite(page)) return 1;
  return Math.min(max, Math.max(1, Math.floor(page)));
}

/**
 * Which PDF page to open. A valid `?p=` (positive whole number) wins and is clamped to the chapter;
 * anything else (missing, `0`, negative, `abc`, `2.5`) is ignored in favour of the last read page, then page 1.
 */
export function resolveInitialPage(i: { param: string | null | undefined; lastPage: number | null | undefined; pageCount: number }): number {
  const raw = i.param?.trim() ?? "";
  if (/^\d+$/.test(raw) && Number(raw) >= 1) return clampPage(Number(raw), i.pageCount);
  if (i.lastPage && Number.isFinite(i.lastPage) && i.lastPage >= 1) return clampPage(i.lastPage, i.pageCount);
  return 1;
}

export function pagesWithQuestions(map: QuestionsByPage): number[] {
  return Object.keys(map).filter((k) => (map[k]?.length ?? 0) > 0).map(Number).sort((a, b) => a - b);
}

export const nextPageWithQuestions = (map: QuestionsByPage, page: number) => pagesWithQuestions(map).find((p) => p > page);
export const previousPageWithQuestions = (map: QuestionsByPage, page: number) => pagesWithQuestions(map).reverse().find((p) => p < page);

/** The page with questions closest to `page` (ties go forward). Used for the "Page x has questions" hint. */
export function nearestPageWithQuestions(map: QuestionsByPage, page: number): number | undefined {
  let best: number | undefined;
  for (const p of pagesWithQuestions(map)) {
    if (best === undefined) { best = p; continue; }
    const d = Math.abs(p - page), bd = Math.abs(best - page);
    if (d < bd || (d === bd && p > best)) best = p;
  }
  return best;
}

// ---------- practice state ----------

const answeredOnce = (s: QState | undefined) => s?.firstCorrect !== undefined;
const started = (s: QState | undefined) => Boolean(s && (s.chosen.length > 0 || answeredOnce(s)));

/** Where to start on a page: the first question not yet answered, else the first. */
export function firstUnansweredIndex(qs: StudyQuestion[], states: StateMap): number {
  const i = qs.findIndex((q) => !answeredOnce(states[q.id]));
  return i < 0 ? 0 : i;
}

export type PageSummary = { total: number; answered: number; correct: number; wrongIds: string[]; complete: boolean };

/** Counts use the FIRST attempt of each question (retries never change accuracy). */
export function pageSummary(qs: StudyQuestion[], states: StateMap): PageSummary {
  let answered = 0, correct = 0;
  const wrongIds: string[] = [];
  for (const q of qs) {
    const s = states[q.id];
    if (!answeredOnce(s)) continue;
    answered++;
    if (s?.firstCorrect) correct++; else wrongIds.push(q.id);
  }
  return { total: qs.length, answered, correct, wrongIds, complete: qs.length > 0 && answered === qs.length };
}

export type FollowDecision = "none" | "switch" | "defer";

/**
 * "Follow my reading". When the PDF moves to a page that has questions:
 * switch automatically if the current page's questions are all answered or none were started,
 * otherwise defer (show "Page x has k questions — Switch") so work in progress is never interrupted.
 */
export function followDecision(i: { follow: boolean; practisedPage: number | null; targetPage: number; map: QuestionsByPage; states: StateMap }): FollowDecision {
  if (!i.follow) return "none";
  if ((i.map[String(i.targetPage)]?.length ?? 0) === 0) return "none";
  if (i.practisedPage === i.targetPage) return "none";
  const current = i.practisedPage === null ? [] : i.map[String(i.practisedPage)] ?? [];
  if (current.length === 0) return "switch";
  const allAnswered = current.every((q) => answeredOnce(i.states[q.id]));
  const noneStarted = current.every((q) => !started(i.states[q.id]));
  return allAnswered || noneStarted ? "switch" : "defer";
}

// ---------- state transitions (used by the practice reducer) ----------

export function pickOption(q: StudyQuestion, state: QState | undefined, index: number): QState {
  const multi = q.type === "multiple_correct";
  const cur = state?.chosen ?? [];
  const chosen = multi ? (cur.includes(index) ? cur.filter((x) => x !== index) : [...cur, index].sort((a, b) => a - b)) : [index];
  return { chosen, checked: false, attemptNo: state?.attemptNo ?? 1, firstCorrect: state?.firstCorrect };
}

/** Locks the answer. Returns null when there is nothing to check (no choice, or already checked). */
export function checkAnswer(q: StudyQuestion, state: QState | undefined): { next: QState; correct: boolean } | null {
  if (!state || state.chosen.length === 0 || state.checked) return null;
  const correct = isCorrect(state.chosen, q.payload.correct);
  return { correct, next: { ...state, checked: true, firstCorrect: state.firstCorrect ?? correct } };
}

export function retryQuestion(state: QState | undefined): QState {
  return { chosen: [], checked: false, attemptNo: (state?.attemptNo ?? 1) + 1, firstCorrect: state?.firstCorrect };
}

// ---------- source passage finder ----------

/** Normalises text so PDF text and our stored `source_text` can be compared: ligatures, quotes, dashes, hyphenation, spacing. */
export function normaliseForMatch(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/\u00ad/g, "")
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/-\s*\n\s*/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type SpanRange = { from: number; to: number };

/**
 * Finds the passage in the page's text spans (the PDF text layer, one string per span, in reading order).
 * Matches the whole `source` if present, otherwise the longest piece of it of at least `minLen`
 * characters. Returns the inclusive span range to highlight, or null.
 */
export function findPassageInSpans(spans: string[], source: string, minLen = 20): SpanRange | null {
  const src = normaliseForMatch(source);
  if (src.length < minLen) return null;
  const starts: number[] = [];
  let page = "";
  spans.forEach((s, idx) => {
    const n = normaliseForMatch(s);
    if (n === "") return;
    if (page !== "") page += " ";
    starts[idx] = page.length;
    page += n;
  });
  if (page === "") return null;

  const contains = (len: number): number => {
    for (let i = 0; i + len <= src.length; i++) {
      const at = page.indexOf(src.slice(i, i + len));
      if (at >= 0) return at;
    }
    return -1;
  };

  // The longest common substring length is monotonic, so binary search it.
  let lo = minLen, hi = src.length, bestLen = 0, bestAt = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const at = contains(mid);
    if (at >= 0) { bestLen = mid; bestAt = at; lo = mid + 1; } else hi = mid - 1;
  }
  if (bestAt < 0) return null;

  const end = bestAt + bestLen - 1;
  let from = -1, to = -1;
  spans.forEach((s, idx) => {
    if (starts[idx] === undefined) return;
    const a = starts[idx];
    const b = a + normaliseForMatch(s).length - 1;
    if (b >= bestAt && a <= end) { if (from < 0) from = idx; to = idx; }
  });
  return from < 0 ? null : { from, to };
}

// ---------- split pane ----------

export const SPLIT_HANDLE = 12;
export const SPLIT_DEFAULT = 45;

/** Allowed left-panel percentage so neither pane falls below its minimum width (320 / 360 px; swapped 360 / 320). */
export function splitBounds(width: number, swap: boolean) {
  const available = Math.max(1, width - SPLIT_HANDLE);
  const leftMin = swap ? 360 : 320;
  const rightMin = swap ? 320 : 360;
  const maxLeft = available - rightMin;
  if (leftMin > maxLeft) return { min: 50, max: 50 };
  return { min: Math.ceil((leftMin / available) * 100), max: Math.floor((maxLeft / available) * 100) };
}

export const clampRatio = (ratio: number, width: number, swap: boolean) => {
  const b = splitBounds(width, swap);
  return Math.max(b.min, Math.min(b.max, ratio));
};

// ---------- keyboard ----------

export type ShortcutAction =
  | { type: "choose"; index: number }
  | { type: "enter" } | { type: "next" } | { type: "previous" } | { type: "bookmark" } | { type: "source" }
  | { type: "retry" } | { type: "questions" } | { type: "toggleViewer" } | { type: "pdfPrevious" } | { type: "pdfNext" }
  | { type: "goToPage" } | { type: "help" };

export type KeyInfo = { key: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; inEditable?: boolean };

/** Maps a key press to a workspace action, or null. Ignored while typing in a field or with Ctrl/Meta/Alt held. */
export function shortcutFor(e: KeyInfo): ShortcutAction | null {
  if (e.inEditable || e.ctrlKey || e.metaKey || e.altKey) return null;
  if (/^[1-8]$/.test(e.key)) return { type: "choose", index: Number(e.key) - 1 };
  switch (e.key) {
    case "Enter": return { type: "enter" };
    case "n": case "N": return e.shiftKey ? { type: "previous" } : { type: "next" };
    case "b": case "B": return { type: "bookmark" };
    case "s": case "S": return { type: "source" };
    case "r": case "R": return { type: "retry" };
    case "q": case "Q": return { type: "questions" };
    case "v": case "V": return { type: "toggleViewer" };
    case "[": return { type: "pdfPrevious" };
    case "]": return { type: "pdfNext" };
    case "/": return { type: "goToPage" };
    case "?": return { type: "help" };
    default: return null;
  }
}
