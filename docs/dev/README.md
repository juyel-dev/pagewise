# Developer guide — start here

For a human developer or an AI agent joining the project. Read this page, then pick work from `docs/status.md`.

## 1. Run it (5 minutes)

Prerequisites: Node.js 22+, npm 10+, Git.
```bash
git clone https://github.com/juyel-dev/pagewise.git && cd pagewise
npm install                                  # installs every workspace
cp apps/web/.env.example apps/web/.env.local # then fill in the values (section 2)
npm run dev                                  # student app → http://localhost:3000
```
Checks (run all four before every PR; CI runs the same):
```bash
npm run typecheck && npm run lint && npm test && npm run build
```
Without Supabase values the landing and legal pages still run; study, sign-in and data need a project.

## 2. Environment variables (`apps/web/.env.local`)
| Variable | Needed for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything with data | Supabase → Project settings → API (both or neither; one alone fails the build, by design) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs | `http://localhost:3000` locally |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer "Contact" link (hidden if empty) | Owner |
| `NEXT_PUBLIC_GOOGLE_AUTH`, `NEXT_PUBLIC_APP_OPEN`, `NEXT_PUBLIC_NCERT_FALLBACK` | Feature flags | See `apps/web/.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Admin app only, never the student app** | Supabase API settings; never commit, never paste in chat |
The shared development database is the Supabase project `pagewise` (test data, mistakes are fine; decision 44). Ask the owner for access, or create your own free project and apply `supabase/migrations/` in order.

## 3. Map of the repo
```
apps/web/               student app        packages/question-schema/  format, validation, grading, fixtures
apps/admin/             staff console (planned, docs/blueprint/18)
supabase/migrations/    database (only way to change it)   supabase/tests/  SQL tests
docs/walkthrough/       how every page looks (visual source of truth)
docs/spec/              behaviour, components, data contracts, acceptance tests
docs/blueprint/         architecture and product blueprints   docs/decisions.md  every decision
docs/status.md          where we are, what is next
```

## 4. How to pick up and finish a piece of work
1. Open `docs/status.md` → "Next". Take the first item. Open its linked **build step** in `docs/product/05-build-order.md`.
2. Read, in this order: the build step → the page's **walkthrough** (`docs/walkthrough/NN-*.md`) → its **spec** (`docs/spec/screens/`, if it exists) → `docs/spec/02-components.md` for every component named → `docs/spec/04-data-contracts.md`.
3. **If anything you need is not written, stop.** Add it under the spec's *Open questions* in a small docs PR and ask the owner. Do not decide it in code (decision 47).
4. Branch from `main` (`feat/<step>-<short-name>`), build in small PRs (one concern each), write tests with the code.
5. Before opening the PR: all four checks pass; run the page in light and dark, at 360 / 768 / 1280 px, and with the keyboard only.
6. Open the PR with the template, link the walkthrough/spec sections, tick the Definition of Done. Update `docs/status.md` if the state changed.
7. Merge when CI is green and the owner (or reviewer) approves. Vercel deploys `main`.

## 5. Test data
`packages/question-schema/fixtures/` holds valid and invalid question files covering every type and edge case (decision 47 follow-up). Use them in unit tests and, once the seeding script lands (build step B0), to populate a development database. Never put real NCERT text in fixtures.

## 6. Rules that always apply
Read `docs/dev/conventions.md`. The short version: tokens only (no hard-coded colours), copy through message catalogues, no data access in components, Google-only sign-in, no invented numbers, no tracking pixels, never commit secrets.
