# 05 · Build order

**Status:** Proposed 2026-11-08, decision 51. Turns the walkthrough (`docs/walkthrough/`) into an ordered list of PR-sized steps. **Changes the earlier order:** student-facing quality and speed now come before the admin app, because the owner's priority is the feel of the student app. The admin app moves later; until then staff keep using the existing `/review` and `/admin/import` routes (protected by Google sign-in and database roles; Google + TOTP arrives with `apps/admin`).

**How to read:** each step has a goal, specs to follow, new data needed, and a done-test. Steps are built in order; a step may be split into several PRs. Size is relative: **S** (a few PRs), **M**, **L**.

## B0 · Tooling that makes later steps safe — S
Goal: confidence and measurement before the big UI work.
Includes: Playwright with axe (smoke: landing, study hub, workspace on fixtures); Lighthouse CI on previews with the budgets in `blueprint/16`; Sentry (web); typed rate limiting on write actions; dev seeding script that loads `packages/question-schema/fixtures/valid/*` into a development project; Storybook-style `/dev/components` page behind an env flag (never in production).
Done when: a PR runs typecheck, lint, tests, SQL tests, Playwright smoke and Lighthouse automatically.

## B1 · Design system — M  ✅ built 2026-11-08 (PR open → see status.md)
Specs: `walkthrough/00-tour.md` §3, `spec/01-design-language.md`, `spec/02-components.md` (A and E sections).
Build: type roles v2 and spacing scale in tokens; Button (sizes, loading, icons), IconButton, Chip, SegmentedControl, Tabs, Card, Input/Select/Textarea, Checkbox/Switch, ProgressBar, ProgressRing, Skeleton, EmptyState, StatusPage (+offline), Toast, Dialog, Sheet, Tooltip, KeyHint. Light and dark.
Done when: every component has tests (all states, keyboard), contrast script passes, the `/dev/components` page shows them all.
*Built:* type roles (`text-display … text-caption`), Button (+sm, danger, loading, icons), IconButton, Chip, Badge, SegmentedControl, Tabs, Card/CardLink, TextField/TextareaField/SelectField, Checkbox, Switch, ProgressBar, ProgressRing, Skeleton, EmptyState, KeyHint, Tooltip, Dialog, Sheet (on one `Modal` base), Toast (`ToastProvider` in the root layout). 54 component tests with axe; gallery at `/dev/components` (dev only; set `NEXT_PUBLIC_DEV_COMPONENTS=true` to expose it on a preview). Not built here: StatusPage offline variant and the study-specific components (they belong to B3).

## B2 · Shells and i18n scaffold — M
Specs: `walkthrough/00-tour.md` §2, §4.
Build: public header/footer; app shell with light sidebar (desktop) and bottom tab bar (phone) and "More" sheet; account menu; theme and language menus; search trigger (palette itself in B8); GuestBanner; offline pill; `next-intl` with English catalogue (`area.section.element` keys); redirect `/start` → `/study`.
Done when: all existing pages sit inside the new shells and pass the Definition of Done.

## B3 · Study workspace — L (the core)
Specs: `walkthrough/06-study-workspace.md` (visual), `spec/screens/S05-study-workspace.md` (behaviour, 28 acceptance tests), `spec/04-data-contracts.md`.
Build in this order: (1) pure helpers and tests; (2) `StudyStore` (Local/Remote); (3) hooks (progress, practice session reducer, split pane, shortcuts, prefs); (4) SplitPane, PdfToolbar, PageChipRail, QuestionCard v2, QuestionDots, PageSummary, SourceQuote; (5) PdfViewer: lazy page sizes, mixed sizes, render window, `highlight()`; (6) assembly with all states and the phone layout; (7) analytics and accessibility pass.
Data: none new (server grading already live).
Done when: all 28 acceptance tests pass; first-usable < 3 s and page turn < 200 ms on the reference profile.

## B4 · Home and Study hub — M
Specs: `walkthrough/04-home.md`, `walkthrough/05-study-hub.md`.
Data: queries for daily goal progress, streak, 7-day accuracy, weak topics (topic accuracy from attempts), chapter progress; `profiles.prefs` for hub filter; verify `profiles.daily_goal`.
Done when: both pages show real data or honest empty states for a new user, a guest, and a heavy user (fixtures).

## B5 · Landing, Sign-in, Onboarding — M
Specs: `walkthrough/01-landing.md`, `02-sign-in.md`, `03-onboarding.md`.
Build: new landing (sections S1–S9, FAQ, subjects from DB), sign-in card, three-step onboarding (age gate behind a flag, off until the owner's legal text arrives), `config/landing-sample.ts` (owner approves the sample question).
Done when: signed-in users never see the landing; the new-user path Landing → Study → Workspace works with no account.

## B6 · Bookmarks, Progress, Settings — M
Specs: `walkthrough/08-progress-bookmarks-settings.md`.
Data: `export_my_data()` and `delete_my_account()` database functions with SQL tests; `profiles.prefs` fields for study defaults; missed-questions query (latest first attempt wrong, not marked understood) and a `bookmarks`/`understood` flag if absent.
Done when: guest and signed-in both work; export downloads; delete removes everything and signs out.

## B7 · Practice sessions and review queue — L
Specs: `walkthrough/07-practice.md`.
Data (migrations + SQL tests): `practice_sessions`, `practice_session_items`, `review_items` (Leitner box, `due_at`), policies per user; wrong first attempts enter `review_items` through a database trigger.
Build: quick practice first (hub, setup, session, result), then review queue. **Chapter test (hidden answers) waits for B10.**
Done when: quick practice and review queue work end to end for signed-in users and (quick only) guests.

## B8 · Search, Help, Legal, System pages — M
Specs: `walkthrough/09-search-help-legal-system.md`.
Data: `feedback` table (insert-only policy, rate limit) ; question text search (trigram or full-text index on published payload).
Legal text comes from the owner (decision 48); engineering ships the structure and print styles.
Done when: palette, help form, three legal pages, 404/error/offline/no-access pages are live.

## B9 · Admin app (`apps/admin`) — L
Specs: `walkthrough/10-admin-console.md`, `blueprint/18-admin-app-spec.md`.
Data: `user_invites`; aal2 policies (decision 42); revalidate endpoint and tags; move staff code out of `apps/web`.
Done when: acceptance criteria in `blueprint/18` §7 pass and `apps/web` has no staff routes.

## B10 · Chapter test with hidden answers — M
Needs a short spec first (open item in decision 50): answer key table, `submit_session` RPC, what is revealed when. Then build test mode, palette, result review.

## Order summary
`B0 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8 → B9 → B10`. B1–B3 are the biggest quality lift; B4–B5 make the first visit feel finished; B6–B8 complete the app; B9–B10 harden and extend.

## Data needed, collected (verify against the live schema before writing each migration)
| Need | Used by | Step |
|---|---|---|
| `practice_sessions`, `practice_session_items` | Practice | B7 |
| `review_items` + trigger from attempts | Review queue, Home tile | B7 |
| `feedback` | Help form | B8 |
| Question text search index | Search palette | B8 |
| `export_my_data()`, `delete_my_account()` | Settings | B6 |
| Missed-questions "understood" flag | Bookmarks (Missed tab) | B6 |
| `user_invites`, aal2 policies, revalidate tags | Admin | B9 |
| Answer-key table, `submit_session` RPC | Chapter test | B10 |
| Rate-limit store (or edge limiter) | All write actions | B0 |

## Risks to watch
Scope creep inside a step (split the PR instead); UI drift (a component used before it is in the design system); data model changes mid-build (write the migration and SQL test first); reviewer fatigue (keep PRs small and screenshot-led, light and dark).
