# Project status (living document)

Update this file in any PR that changes the state. Last updated: **2026-11-07**.

## Where we are

| Area | State |
|---|---|
| Student app | Live at `neet-aspirants.vercel.app`; Google + guest sign-in; study workspace; Biology 11 Ch-1 (171 questions) published |
| Repo | npm-workspaces monorepo: `apps/web`, `packages/question-schema` (F1 done) |
| Hardening | Server-side grading trigger live (migration 0007), security headers, typed env, error/404/loading, robots/sitemap/manifest (F2 done) |
| Infrastructure | Supabase `pagewise` in `ap-south-1`; Vercel functions in `bom1`; SSO protection off (site is public) |
| Planning | Docs 14–18 and the two-year plan written; decisions 39–46 logged |

## Next, in order

1. **H1 / F3:** build `apps/admin` per `blueprint/18` (spec approval first).
2. **H1 / F4:** workspace refactor + PDF viewer speed (doc 16 §2 list).
3. Sentry, Playwright smoke tests, rate limiting.
4. **H2 / F5:** UI polish pass per `blueprint/17`.

## Open items for the owner

- Revoke any GitHub token that was pasted into chat; give a new short-lived one for the next session.
- Confirm `pagewise-admin` is free as a Vercel project name when F3 starts (otherwise pick another).
- Decide the production custom domain before H4.
- Line up a lawyer for the DPDP / under-18 review before H4.
- Recruit beta students before H3.

## Known issues

- Full CSP is report-only until nonces are added.
- PWA install needs 192/512 px PNG icons (design asset).
- The design canvas contains three known deviations from product rules (`blueprint/14` §13).
