import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { QUESTION_TYPES, isCorrect, toPayload, validatePageFile } from "../index";

const dir = join(__dirname, "..", "..", "fixtures");
const read = (p: string) => JSON.parse(readFileSync(join(dir, p), "utf8"));

describe("valid fixtures", () => {
  const files = readdirSync(join(dir, "valid")).filter((f) => f.endsWith(".json"));
  it("exist", () => expect(files.length).toBeGreaterThanOrEqual(5));
  for (const f of files) {
    it(`${f} validates and grades its own correct answers`, () => {
      const r = validatePageFile(read(`valid/${f}`));
      expect(r.ok, r.ok ? "" : r.errors.join("\n")).toBe(true);
      if (!r.ok) return;
      for (const q of r.file.questions) {
        const p = toPayload(q);
        expect(isCorrect(p.correct, p.correct)).toBe(true);
        expect(isCorrect([], p.correct)).toBe(false);
      }
    });
  }
  it("covers every question type", () => {
    const seen = new Set<string>();
    for (const f of files) for (const q of read(`valid/${f}`).questions) seen.add(q.type);
    for (const t of QUESTION_TYPES) expect(seen.has(t), `missing type ${t}`).toBe(true);
  });
});

describe("invalid fixtures", () => {
  const cases: { name: string; expect: string; file: unknown }[] = read("invalid-cases.json");
  it("has cases", () => expect(cases.length).toBeGreaterThanOrEqual(15));
  for (const c of cases) {
    it(`rejects: ${c.name}`, () => {
      const r = validatePageFile(c.file);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.join("\n").toLowerCase()).toContain(c.expect.toLowerCase());
    });
  }
});
