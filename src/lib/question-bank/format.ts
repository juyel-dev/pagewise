/**
 * Question-bank page-file format (repo juyel-dev/neet-biology-question-bank, one JSON file per source PDF page).
 * Validation here is the single gate used by the import screen (preview) and the server action (authoritative).
 */
export const QUESTION_TYPES = ["single_correct", "multiple_correct", "multiple_statement", "match_the_following", "assertion_reason"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type BankSource = {
  class: number; subject: string; unit: string; section: string; chapter: string | null;
  pdf_file: string; pdf_page: number; chapter_page: number | null; source_scope: string;
};
export type BankQuestion = {
  id: string; type: QuestionType; topic: string; question: string; options: string[];
  correct_option?: number; correct_options?: number[]; column_a?: string[]; column_b?: string[];
  explanation: string; source_text: string; difficulty: (typeof DIFFICULTIES)[number];
  question_origin: string; verification: string;
};
export type BankPageFile = { source: BankSource; question_count: number; questions: BankQuestion[] };

/** What is stored in question_versions.payload and shown to students. */
export type QuestionPayload = {
  topic: string; question: string; options: string[]; correct: number[];
  column_a?: string[]; column_b?: string[]; explanation: string; source_text: string;
  question_origin: string; verification: string;
};

const MAX_EXCERPT = 400;
const ID_RE = /^BIO-C(11|12)-[A-Z0-9-]+-P(\d{3})-Q(\d{3})$/;
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

export type ValidationResult = { ok: true; file: BankPageFile; warnings: string[] } | { ok: false; errors: string[] };

export function validatePageFile(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const root = input as Record<string, unknown> | null;
  if (!root || typeof root !== "object") return { ok: false, errors: ["File is not a JSON object."] };

  const src = root.source as Record<string, unknown> | undefined;
  if (!src || typeof src !== "object") return { ok: false, errors: ["Missing source block."] };
  if (src.class !== 11 && src.class !== 12) errors.push("source.class must be 11 or 12.");
  if (!isStr(src.subject)) errors.push("source.subject is required.");
  if (!isStr(src.pdf_file)) errors.push("source.pdf_file is required.");
  if (!isInt(src.pdf_page) || (src.pdf_page as number) < 1) errors.push("source.pdf_page must be a whole number from 1.");
  if (!Array.isArray(root.questions)) return { ok: false, errors: [...errors, "questions must be an array."] };
  if (root.question_count !== root.questions.length) errors.push(`question_count (${String(root.question_count)}) does not match the ${root.questions.length} questions in the file.`);

  const ids = new Set<string>();
  (root.questions as unknown[]).forEach((raw, i) => {
    const q = raw as Record<string, unknown>;
    const at = `Question ${i + 1}${isStr(q?.id) ? ` (${q.id})` : ""}`;
    const bad = (m: string) => errors.push(`${at}: ${m}`);
    if (!q || typeof q !== "object") return bad("is not an object.");

    const m = isStr(q.id) ? ID_RE.exec(q.id) : null;
    if (!m) bad("id must look like BIO-C11-U01-CH01-P004-Q001.");
    else {
      if (Number(m[2]) !== src.pdf_page) bad(`id says page ${Number(m[2])} but the file is for page ${String(src.pdf_page)}.`);
      if (Number(m[1]) !== src.class) bad(`id says class ${m[1]} but the file is for class ${String(src.class)}.`);
      if (ids.has(q.id as string)) bad("duplicate id in this file."); else ids.add(q.id as string);
    }
    if (!QUESTION_TYPES.includes(q.type as QuestionType)) return bad(`type must be one of ${QUESTION_TYPES.join(", ")}.`);
    if (!isStr(q.question)) bad("question text is empty.");
    if (!isStr(q.explanation)) bad("explanation is empty.");
    if (!isStr(q.source_text)) bad("source_text is empty."); else if ((q.source_text as string).length > MAX_EXCERPT) bad(`source_text is longer than ${MAX_EXCERPT} characters. Keep excerpts short.`);
    if (!DIFFICULTIES.includes(q.difficulty as never)) bad("difficulty must be easy, medium or hard.");
    if (!isStr(q.topic)) warnings.push(`${at}: topic is empty.`);

    const opts = q.options;
    if (!Array.isArray(opts) || opts.length < 2 || opts.length > 8 || !opts.every(isStr)) return bad("options must be 2 to 8 non-empty strings.");
    // case matters (e.g. "Mangifera indica" vs "Mangifera Indica" in nomenclature questions)
    const norm = (opts as string[]).map((o) => o.trim());
    if (new Set(norm).size !== norm.length) bad("two options are identical.");

    if (q.type === "multiple_correct") {
      const c = q.correct_options;
      if (!Array.isArray(c) || c.length < 2 || !c.every((n) => isInt(n) && n >= 0 && n < opts.length) || new Set(c).size !== c.length) bad("correct_options must be 2 or more different valid option numbers.");
      if (q.correct_option !== undefined) bad("multiple_correct must not have correct_option.");
    } else {
      if (!isInt(q.correct_option) || (q.correct_option as number) < 0 || (q.correct_option as number) >= opts.length) bad("correct_option must be a valid option number.");
      if (q.correct_options !== undefined) bad(`${String(q.type)} must not have correct_options.`);
    }
    if (q.type === "match_the_following") {
      const a = q.column_a, b = q.column_b;
      if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2 || !a.every(isStr) || !b.every(isStr)) bad("match_the_following needs column_a and column_b with 2 or more items each.");
    }
    if (q.type === "assertion_reason" && !(/assertion/i.test(String(q.question)) && /reason/i.test(String(q.question)))) bad("assertion_reason question must contain both an Assertion and a Reason.");
  });

  return errors.length ? { ok: false, errors } : { ok: true, file: root as unknown as BankPageFile, warnings };
}

export function toPayload(q: BankQuestion): QuestionPayload {
  return {
    topic: q.topic, question: q.question, options: q.options,
    correct: q.type === "multiple_correct" ? [...(q.correct_options as number[])].sort((a, b) => a - b) : [q.correct_option as number],
    ...(q.column_a ? { column_a: q.column_a, column_b: q.column_b } : {}),
    explanation: q.explanation, source_text: q.source_text, question_origin: q.question_origin, verification: q.verification,
  };
}

export function isCorrect(chosen: number[], correct: number[]): boolean {
  return chosen.length === correct.length && [...chosen].sort((a, b) => a - b).every((n, i) => n === [...correct].sort((a, b) => a - b)[i]);
}
