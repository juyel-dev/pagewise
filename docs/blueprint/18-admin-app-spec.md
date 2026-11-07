# Blueprint · 18 · Admin app (`apps/admin`) spec

**Status:** Proposed — spec to be approved before F3 is built (spec §13). Decisions 39, 42, 43. Replaces the earlier "separate repo" idea (decision 30).

## 1. Goals and non-goals

**Goals:** let staff import, review, publish and retire questions, manage chapters/PDFs/page maps, handle reports and roles, with a full audit trail; keep that code and its privileges out of the student app.
**Non-goals now:** analytics dashboards, content release management UI, bulk editing tools (later, H5+).

## 2. Deployment

- Second Next.js app in this repo: `apps/admin`. Own Vercel project, Root Directory `apps/admin`, URL `pagewise-admin.vercel.app`.
- Same Supabase project/region as the student app. Compute in `bom1`.
- Not indexed (`robots` disallow all), no links from the student app, strict CSP (enforced, not report-only) because it has little third-party content.

## 3. Authentication and authorization

1. Staff sign in with **Google** (decision 27).
2. A staff profile must have role `reviewer` or `admin`; anyone else is shown "no access" and signed out.
3. Staff must complete **TOTP**: first sign-in enrolls an authenticator app; later sign-ins ask for the code. The session must be `aal2` (decision 42).
4. The database enforces it: `is_staff()` and `is_admin()` require `aal2`, so even a leaked admin cookie without the second factor cannot write.
5. Service-role key lives only in this project's environment and is used only in server code, never sent to the browser.
6. Role changes go through one RPC that writes `audit_log` and refuses to remove the last admin.

## 4. Screens (see canvas boards "Admin · …")

| Screen | Purpose | Key rules |
|---|---|---|
| Sign in + TOTP | Gate | No password field (Google only) |
| Dashboard | Work waiting: questions in review, open reports, chapters by status | Counts are real queries |
| Review queue | Page-grouped list, question editor, approve/publish, request changes, retire | Edits create a new immutable version |
| Import | Drop page files, validate with `@pagewise/question-schema`, import as `in_review` | Same validator the web app trusts |
| Chapters and PDFs | Create chapter, upload PDF (sha256 dedupe, decision 36c), publish chapter | PDF stays in private storage |
| Page maps | PDF page → printed label and kind; auto-detect helper | Preview against the PDF |
| Reports | Student reports inbox: open, resolve, dismiss | Resolving can link a new version |
| Users and roles | Search, change role, invite reviewer | Last-admin guard |
| Audit log | Filter and export | Read-only |

## 5. Moving code out of the student app

| Today in `apps/web` | Moves to `apps/admin` |
|---|---|
| `src/features/review/*`, `/review` routes | Review queue |
| `src/features/admin/*`, `/admin` routes (import, PDF upload) | Import, Chapters and PDFs |
| `proxy.ts` staff path rules | Admin's own proxy; web keeps only student rules |

Shared logic goes to packages, not copy-paste: `@pagewise/question-schema` (exists), `@pagewise/db` (generated Supabase types, created in F3).

## 6. Publish → student app freshness

1. Admin publishes (writes in a transaction + `audit_log`).
2. Admin server calls `POST {web}/api/revalidate` with a shared secret.
3. Web verifies the secret in constant time, then revalidates cache tags: `chapters`, `chapter:{id}`, `questions:{chapterId}`.
4. Failure to revalidate never fails the publish; it is retried and shown on the dashboard.

## 7. Acceptance criteria for F3

- [ ] Anonymous and student users cannot reach any admin route or write staff tables (RLS tests for each role)
- [ ] A staff session at `aal1` cannot write; at `aal2` it can
- [ ] Import → review → publish works end to end for the Biology 11 Ch-1 files
- [ ] After publish, the student app shows the change within seconds
- [ ] `apps/web` contains no staff routes, no service-role key, no staff-only code
- [ ] Every staff write appears in `audit_log` with actor and before/after summary
- [ ] CI builds both apps; path filters keep unrelated changes from rebuilding both

## 8. Build order inside F3

1. Packages: `@pagewise/db` types; shared env helper.
2. Admin skeleton, Google sign-in, TOTP enroll/verify, role gate, aal2 policies + SQL tests.
3. Dashboard and read-only lists.
4. Import, then review/publish, then revalidate hook.
5. Chapters and PDFs, page maps, reports, users, audit log.
6. Remove staff code from `apps/web`; update `proxy.ts`; update docs and CI.
