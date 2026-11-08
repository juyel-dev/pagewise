# Question fixtures

Sample data for development and tests. **Not real NCERT content.** Ids use `FX` (e.g. `BIO-C11-FX-P001-Q001`) and `question_origin: "fixture"` so they can never be confused with the real bank.

| Path | What it covers |
|---|---|
| `valid/p001-all-five-types.json` | One question of each type: single, multiple, statement-based, match-the-following, assertion–reason |
| `valid/p002-unicode-and-long-text.json` | Hindi and Bengali text, very long stems/options/explanations, line breaks, subscripts |
| `valid/p003-option-limits-and-case.json` | 2 options (minimum), 8 options (maximum), options differing only by case, HTML-looking text that must render as plain text |
| `valid/p004-source-text-at-limit.json` | `source_text` of exactly 400 characters (the maximum) |
| `valid/p005-class12.json` | A Class 12 file |
| `invalid-cases.json` | 17 deliberately broken files, each with the error text it must produce |

Used by `src/__tests__/fixtures.test.ts` (CI) and by UI and end-to-end tests. Add a fixture whenever a bug is found in the format.
