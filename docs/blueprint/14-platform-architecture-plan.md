# Blueprint · 14 · Platform architecture plan (monorepo, boundaries, strategies)

**Status:** Proposed — direction accepted by owner 2026-11-05 (decisions 39–42). Consistent with the locked spec `10`; where it changes a locked decision it does so through change control (see decisions 39–42, each with what / why / impact / alternative / approval).
**Purpose:** decide the structure once so later changes touch one module, not the whole app.

## 1. Principles

1. **Low change cost.** A normal change (new Home section, new feature, new question type, UI redesign) edits one module and one registry line.
2. **Boundaries are enforced by tools, not by habit.** Lint rules, package boundaries and RLS fail the build; reviewers do not have to remember.
3. **Rule of two.** Code becomes a shared package only when a second app needs it. No speculative packages.
4. **Server is the authority.** Correctness, roles and publish state are decided on the server/DB. The UI only reflects them (spec §11).
5. **Truth in copy (decision 13).** No fake numbers in the app. Design canvases use sample numbers for layout only.
6. **Boring tools.** npm workspaces, Next.js, Supabase, Vitest, Playwright, GitHub Actions. No new build tool until two apps make it pay for itself.

## 2. Repository layout (target)

```
apps/web               student app (Next.js 16) — Vercel project 1
apps/admin             staff console (Next.js) — Vercel project 2, own subdomain
packages/question-schema   question page-file format, validation, payload, grading (pure TS, no I/O)
packages/db            (when admin lands) generated Supabase types + typed query helpers
packages/ui            (only if admin needs more than tokens) shared primitives
supabase/              migrations — single source of truth for the database
docs/                  blueprint, decisions, ops
```

Dependency direction: `apps/* → packages/*`. Packages never import apps. `web` and `admin` never import each other. Anything both need goes into a package.

## 3. Inside `apps/web`

```
src/app/            routing only: thin pages, layouts, route handlers (no business logic)
src/features/<x>/   one folder per module: components, queries.ts (reads), actions.ts (writes),
                    types.ts, index.ts (the only public surface), __tests__/
src/config/         registries: nav.ts, home-sections.ts, brand.ts (spec §4, §6)
src/lib/            infrastructure: supabase clients, local IndexedDB, auth/session, flags, env
src/components/ui/  design-system primitives (token based)
```

Rules (enforced by ESLint `no-restricted-imports`):
- `lib` and `components/ui` never import from `features` or `app`.
- `features/a` imports `features/b` only through `features/b/index.ts`.
- Client components never import `server-only` modules.
- No `supabase.from(...)` in components; only in a feature's `queries.ts` / `actions.ts`.

Module contract (spec §3, §12): a feature owns its UI, data access, permissions and empty/loading/error states, and registers itself by one entry in `config/nav.ts` and, if it promotes itself on Home, one entry in `config/home-sections.ts`. Removing a feature = deleting its folder and those entries.

## 4. Data layer

- Supabase Postgres is the system of record. Migrations are numbered, forward-only and reviewed; never edited after merge.
- Schema changes use **expand → migrate → contract** so the old app version keeps working during a deploy.
- Types are generated (`supabase gen types`) into `packages/db` and committed; hand-written row types are removed over time.
- RLS is tested: SQL tests run against a local Supabase in CI (guest, student, reviewer, admin each tried against every table).
- Questions are immutable per version (`question_versions`); attempts reference `version_id`; retire, never delete.
- Guest vs signed-in storage sits behind one interface (`StudyStore` with `LocalStore` and `RemoteStore`), so the workspace has no `if (guest)` branches. The merge function (already tested) stays the single sync rule.

## 5. Correctness and content integrity

- **Now (decision 41):** `recordAttempt` ignores any client `isCorrect`; the server loads the question version and computes it with `grade()` from `packages/question-schema`. `attempts` insert is allowed only through this path.
- Per decision 18, answers stay readable for practice. A **timed chapter test** will need hidden answers; that gets its own mini-spec (answer key in a separate table, revealed after submit through an RPC). Not built until that spec is approved.
- Import validation (`validatePageFile`) lives in the package and is the same gate for admin preview and server action.

## 6. Authentication and authorization

- Students: Google sign-in only (decision 27); guests allowed (decision 38).
- Staff (decision 42): Google sign-in plus TOTP step-up (`aal2`). DB helpers `is_staff()` / `is_admin()` require `aal2`, so a stolen session without the second factor cannot write.
- `apps/admin` runs on its own origin (separate cookies). The Supabase service-role key exists only in the admin project's environment, never in web.
- Role changes go through an RPC that writes `audit_log` and refuses to remove the last admin.

## 7. Performance and caching

- Cache Components: static shell, per-user data streamed. Public content (chapters, page map, published questions) is cached with tags; admin publish calls a signed `/api/revalidate` on web.
- PDF viewer: read page sizes lazily, support mixed page sizes, render window stays small. Performance budget per route is checked in CI from `next build` output.
- Questions load per page when a chapter outgrows one request.
- Targets: LCP < 2.5 s on a mid-range Android over 4G; interaction latency < 200 ms in the workspace.

## 8. Testing

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | pure logic: schema, grading, merge, page map, detector |
| Component | Vitest + Testing Library | QuestionCard, workspace hooks |
| DB / RLS | SQL tests on local Supabase | every policy, every role |
| E2E + a11y | Playwright + axe on Vercel previews | guest flow, answer, sync, admin publish |
| Contrast | `check-contrast.py` | token changes (decision 15) |

A bug fix lands with the test that would have caught it.

## 9. CI/CD and release

- GitHub Actions: install → typecheck → lint → test → build, per app with path filters. Actions pinned by SHA. `npm audit` fails on high.
- One Vercel project per app (Root Directory `apps/web` / `apps/admin`), preview per PR, instant rollback.
- Trunk-based: short branches, squash merge, conventional commits.
- Migrations reach production through a manual, gated workflow, never from a developer laptop.
- Risky changes ship behind a flag (`lib/flags`), then the flag is removed.

## 10. Observability and operations

- Sentry in both apps; structured logs in server actions; Vercel Speed Insights.
- Product analytics cookieless, no ad pixels (decision 14). `attempts` is the source for learning analytics.
- Typed `env.ts` per app validates variables at boot and fails fast.
- Route-group `error.tsx`, `loading.tsx`, `not-found.tsx`; `robots`, `sitemap`, `manifest`.

## 11. i18n and accessibility

- New UI text goes through message catalogs (decision 3, `next-intl`); no new hard-coded sentences once the catalog lands.
- Every interactive element is a real control with a visible focus state; touch targets ≥ 44 px; contrast machine-checked.

## 12. Delivery phases (each is its own PR set)

| Phase | Deliverable | Done when |
|---|---|---|
| F0 | This doc + decisions 39–42 | merged |
| F1 | Monorepo: `apps/web`, `packages/question-schema`, typecheck fixed, CI updated | CI green; web deploys from `apps/web` |
| F2 | Hardening: server-side grading, security headers/CSP, env module, error/loading/not-found, robots/sitemap/manifest | tests for grading; headers verified |
| F3 | `apps/admin`: Google + MFA gate, move `/review` and `/admin`, revalidate hook; remove from web | admin live; web has no staff routes |
| F4 | Study workspace refactor (hooks, `StudyStore`) + PDF viewer optimisation | file < 200 lines per unit; mixed-size PDFs correct |
| F5 | UI rebuild from the Design canvas **using repo tokens** (decision 34 palette) | screens match canvas layout, contrast green |
| F6 | New features, one mini-spec each (spec §13): chapter test, review queue, search, notes, goals | per spec |

## 13. Corrections to the Design canvas (layout only, not product)

The canvas used its own colors and a few flows the product rules do not allow. When building, follow the repo, not the canvas:
- Palette: use decision 34 tokens, not the canvas indigo.
- Sign-in: Google only (decision 27); the canvas email-link and admin password fields are dropped. Staff add a TOTP step.
- Sample numbers (progress, streak, counts) are layout placeholders; the app shows real data only (decision 13).

## 14. Risks and open points

- Changing Vercel Root Directory affects the live deploy; do it when F1 merges, not before.
- A staging Supabase project is advisable before F3; free tier allows two active projects.
- Sentry and PostHog/Plausible accounts are needed from F2.
