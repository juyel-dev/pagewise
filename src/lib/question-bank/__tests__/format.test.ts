import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isCorrect, toPayload, validatePageFile, type BankPageFile } from "../format";

const base = (over: Record<string, unknown> = {}, q: Record<string, unknown> = {}) => ({
  source: { class: 11, subject: "Biology", unit: "U", section: "S", chapter: "C", pdf_file: "kebo101.pdf", pdf_page: 4, chapter_page: 2, source_scope: "x" },
  question_count: 1,
  questions: [{ id: "BIO-C11-U01-CH01-P004-Q001", type: "single_correct", topic: "t", question: "Q?", options: ["a", "b", "c", "d"], correct_option: 1,
    explanation: "e", source_text: "short", difficulty: "easy", question_origin: "NCERT-based", verification: "reviewed_against_source", ...q }],
  ...over,
});

describe("validatePageFile", () => {
  it("accepts a valid single-answer question and normalises the payload", () => {
    const r = validatePageFile(base());
    expect(r.ok).toBe(true);
    if (r.ok) expect(toPayload(r.file.questions[0]).correct).toEqual([1]);
  });
  it("catches a question filed under the wrong page", () => {
    const r = validatePageFile(base({}, { id: "BIO-C11-U01-CH01-P005-Q001" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join()).toContain("says page 5");
  });
  it("catches count mismatch, bad answer index and duplicate options", () => {
    const r = validatePageFile(base({ question_count: 2 }, { correct_option: 9, options: ["a", "a ", "c", "d"] }));
    expect(r.ok).toBe(false);
    if (!r.ok) { const t = r.errors.join("\n"); expect(t).toContain("question_count"); expect(t).toContain("valid option number"); expect(t).toContain("identical"); }
  });
  it("treats options that differ only by letter case as different", () => {
    expect(validatePageFile(base({}, { options: ["Mangifera indica", "Mangifera Indica", "c", "d"] })).ok).toBe(true);
  });
  it("requires 2+ correct options for multiple_correct and forbids correct_option", () => {
    expect(validatePageFile(base({}, { type: "multiple_correct", correct_options: [0], correct_option: undefined })).ok).toBe(false);
    const ok = validatePageFile(base({}, { type: "multiple_correct", correct_options: [2, 0], correct_option: undefined }));
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(toPayload(ok.file.questions[0]).correct).toEqual([0, 2]);
  });
  it("requires columns for match and both parts for assertion-reason", () => {
    expect(validatePageFile(base({}, { type: "match_the_following" })).ok).toBe(false);
    expect(validatePageFile(base({}, { type: "assertion_reason", question: "Just a question" })).ok).toBe(false);
  });
  it("rejects long source excerpts", () => {
    expect(validatePageFile(base({}, { source_text: "x".repeat(401) })).ok).toBe(false);
  });
});

describe("isCorrect", () => {
  it("compares answer sets regardless of order", () => {
    expect(isCorrect([2, 0], [0, 2])).toBe(true);
    expect(isCorrect([0], [0, 2])).toBe(false);
  });
});

// Optional: validate the owner's real question bank when QB_DIR points at a checkout of it.
const dir = process.env.QB_DIR;
describe.skipIf(!dir || !existsSync(dir))("owner's question bank", () => {
  it("every page file validates", () => {
    const files: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((n) => { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".json")) files.push(p); });
    walk(join(dir as string, "data"));
    expect(files.length).toBeGreaterThan(0);
    const failures = files.map((f) => ({ f, r: validatePageFile(JSON.parse(readFileSync(f, "utf8")) as BankPageFile) })).filter((x) => !x.r.ok);
    expect(failures.map((x) => x.f + " " + (!x.r.ok ? x.r.errors.join(" | ") : ""))).toEqual([]);
  });
});
