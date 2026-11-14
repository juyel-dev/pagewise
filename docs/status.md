# Project status (living document)

Update this file in any PR that changes the state. Last updated: **2026-11-07**.

## Where we are

| Area | State |
|---|---|
| Student app | Live at `neet-aspirants.vercel.app`; Google + guest sign-in; study workspace; Biology 11 Ch-1 (171 questions) published |
| Repo | npm-workspaces monorepo: `apps/web`, `packages/question-schema` (F1 done) |
| Hardening | Server-side grading trigger live (migration 0007), security headers, typed env, error/404/loading, robots/sitemap/manifest (F2 done) |
| Infrastructure | Supabase `pagewise` in `ap-south-1`; Vercel functions in `bom1`; SSO protection off (site is public) |
| Planning | Docs 14–18 and the two-year plan written; decisions 39–48 logged; **build-ready spec pack started in `docs/spec/`** (S05 Study workspace drafted) |

## Next, in order

0. **Walkthrough first draft complete (pages 00–10), fixtures, developer guide and build order written** (decisions 49–51). Owner reads and corrects the walkthrough.
0. **Build in progress (`docs/product/05-build-order.md`):** B1 design system, B2 shells + i18n and B3a (workspace logic, store, hooks) built. Next: B3b workspace UI; B0 tooling (Playwright, Lighthouse CI, Sentry, rate limiting, seeding) is done alongside because it needs CI and accounts.
0. **Spec pack (decision 47):** write screen specs S06, S07, S03/S04, S11–S13, S08–S10, S14–S16, A01–A09 (see `docs/spec/README.md` register). No screen is rebuilt before its spec is Ready.
1. **H1 / F3:** build `apps/admin` per `blueprint/18` (spec approval first).
2. **H1 / F4:** workspace refactor + PDF viewer speed (doc 16 §2 list).
3. Sentry, Playwright smoke tests, rate limiting.
4. **H2 / F5:** UI polish pass per `blueprint/17`.

## Open items for the owner

- Revoke any GitHub token that was pasted into chat; give a new short-lived one for the next session.
- Confirm `pagewise-admin` is free as a Vercel project name when F3 starts (otherwise pick another).
- Hand over the NCERT permission document the day before production (owner is handling it).
- Legal review (DPDP / under-18): owner is handling it, in progress.
- Questions and their review: owner (decision 48).
- Read `docs/spec/screens/S05-study-workspace.md` and mark it Ready or send changes.
- Decide the production custom domain before H4; recruit beta students before H3.

## Known issues

- Full CSP is report-only until nonces are added.
- PWA install needs 192/512 px PNG icons (design asset).
- The design canvas contains three known deviations from product rules (`blueprint/14` §13).
