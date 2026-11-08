# Conventions and Definition of Done

## Git
- Branches: `feat/…`, `fix/…`, `docs/…`, `chore/…`. Short-lived; rebase or merge `main` often.
- Commits: conventional (`feat(study): …`, `fix(grading): …`, `docs: …`, `test: …`, `chore: …`). One idea per commit.
- PRs: small (aim < 400 changed lines excluding generated files). One concern. Squash or merge commit both fine; never force-push `main`.
- Never commit: secrets, `.env*` with values, personal data, real NCERT content in fixtures.

## Code
- TypeScript strict; no `any` (use `unknown` + narrowing). No default exports except where Next.js requires them.
- Folder rules (lint-enforced): `lib` and `components/ui` never import `features` or routes; features import other features only via their `index.ts`.
- Data access only in a feature's `queries.ts` / `actions.ts` (server). Components never call `supabase.from(...)`.
- Server actions validate every input and return `{ ok: true } | { ok: false, error }`; correctness and roles are decided by the database (decision 41).
- Styling: Tailwind with design tokens only; no hex colours, no one-off pixel values for colour, radius or font. Use the type roles in `docs/walkthrough/00-tour.md` §3.
- Text: no hard-coded user-visible sentences once the message catalogue exists; keys follow `area.section.element`.
- Accessibility: real elements (`button`, `a`, `label`), visible focus, names on icon buttons, no colour-only meaning, ≥ 44 px touch targets.
- Performance: respect `docs/blueprint/16` budgets; no new dependency without a decision-log line; lazy-load anything heavy (PDF, charts).

## Tests
| What | Where | Tool |
|---|---|---|
| Pure logic | next to code in `__tests__/` | Vitest |
| Components and hooks | `__tests__/` | Vitest + Testing Library |
| Question format | `packages/question-schema` (+ fixtures) | Vitest |
| Database rules | `supabase/tests/*.sql` | psql, runs in CI `db` job |
| Full flows, a11y | `e2e/` (planned B0) | Playwright + axe |
Every bug fix lands with the test that would have caught it. Every acceptance test in a spec is either automated or has a manual script in the PR description.

## Database
Only through numbered migrations in `supabase/migrations/`; never edit a merged migration; expand → migrate → contract; every table has RLS and a SQL test for each role; apply to Supabase **before** deploying code that needs it.

## Definition of Done (every PR)
- [ ] Linked walkthrough/spec sections; nothing invented beyond them
- [ ] `typecheck`, `lint`, `test`, `build` pass locally and in CI
- [ ] Tests added or updated (unit, component, SQL as relevant)
- [ ] Light and dark checked; 360 / 768 / 1280 px checked; keyboard-only checked
- [ ] Loading, empty, error, offline states present (where the page has them)
- [ ] No hard-coded colours or user-visible strings; contrast script passes
- [ ] Budgets in `docs/blueprint/16` still met
- [ ] Docs updated (spec change log, `docs/status.md`, decision log if a decision changed)
- [ ] No secrets, no personal data, no real NCERT text added

## Rules for AI agents (in addition to the above)
1. Read `AGENTS.md` and the Next.js docs in `node_modules/next/dist/docs/` before writing Next.js code; this Next version differs from older versions (for example `error.tsx` receives `retry`).
2. Never decide product, design, copy or data questions: if the walkthrough/spec is silent, stop and ask (decision 47).
3. Never touch the production database or deployment settings without the owner's explicit request in the same session; prefer a migration file and a SQL test.
4. Never print, store or echo tokens or keys; if the owner pastes one into chat, tell them to revoke it.
5. Keep PRs small, explain the "why" in the description, and report honestly what was and was not verified.
