# Blueprint · 15 · Environments, domains and release

**Status:** Proposed, decisions 43–45. Companion to `14` (architecture) and `ops/01-deploy-vercel.md`.

## 1. Environments

| Env | Web app | Admin app | Supabase | Data | Purpose |
|---|---|---|---|---|---|
| Local | `npm run dev` | `npm run dev -w @pagewise/admin` | Current `pagewise` project, or `supabase start` for SQL tests | Disposable | Daily work |
| Preview | Vercel preview per PR | Vercel preview per PR | Current `pagewise` project | Test | Review before merge |
| **Dev/Test (today's production)** | `neet-aspirants.vercel.app` | `pagewise-admin.vercel.app` | `pagewise` (ap-south-1) | **Test data; mistakes are acceptable** (owner, 2026-11-07) | Everything until launch |
| **Production (at launch, H4)** | Custom domain | `admin.` subdomain of it | **New** Supabase project, same region | Real users | Public launch |

Why a *new* project at launch instead of a staging project now: the current project was created for testing, so it already is the safe place. At launch we apply every migration from `supabase/migrations/` to a clean project, which also proves that the repo alone can rebuild the database.

## 2. Region rule

Compute must sit next to the database. Database: Mumbai (`ap-south-1`). Vercel functions: `bom1` (set 2026-11-07). The production project at launch uses the same pairing. If the user base moves, move both together.

## 3. Domains

- Student app: `neet-aspirants.vercel.app` now; custom domain at H4.
- Admin app: `pagewise-admin.vercel.app` (decision 43). Staff only; not linked from the student app; `robots` disallow all; separate cookies by origin.
- Auth redirect allow-lists (Supabase Auth → URL configuration) must list each origin. Update when a domain is added.

## 4. Secrets

| Secret | Lives in | Never in |
|---|---|---|
| Supabase anon key, URL | Vercel env, both apps | repo |
| Supabase service-role key | **Admin app project only** | web app, repo, chat |
| GitHub token for automation | Short-lived fine-grained token, revoked after use | chat history, repo |
| Revalidate secret (admin → web) | Both projects' env (same value) | repo |

Rotate any key that has appeared in a chat or log.

## 5. Change flow

1. Branch, small PR, CI (`verify`, `db`) must pass.
2. Database change: migration file + SQL test in `supabase/tests/`. Use expand → migrate → contract.
3. Apply the migration to Supabase **before** deploying code that depends on it; the code must also work against the old schema for one deploy.
4. Merge → Vercel deploys → check deployment state and runtime errors.
5. Rollback: Vercel instant rollback for code; forward-fix migration for data (never edit a merged migration).

## 6. Launch gates (H4) — all must be true

- [ ] NCERT permission recorded and scoped to every hosted book
- [ ] Lawyer-reviewed Terms and Privacy; DPDP parental-consent flow for under-18 users
- [ ] Production Supabase project created from migrations, RLS tests green
- [ ] Backups enabled and one restore rehearsed
- [ ] Error tracking and uptime check live; status page and support inbox exist
- [ ] First-load and interaction budgets met (doc 16)
- [ ] Staff accounts use Google + TOTP; service-role key only in admin project
- [ ] Rate limiting on write actions
- [ ] Owner has read every launch-edition screen

## 7. Backups and recovery

- Before launch: confirm what the current Supabase plan provides for backups and point-in-time recovery; **verify on the pricing page at that time**, do not rely on memory.
- Content truth also lives in git (`neet-pcb-question-bank`, migrations), so questions can always be re-imported. User data (attempts, progress) is the only data that exists nowhere else; protect it first.
