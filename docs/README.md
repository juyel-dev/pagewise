# PageWise documentation

Planning is the product. These docs are written **before** each build step so the app stays coherent as it grows.

## How we build

1. **Frontend first**, screen by screen, in small steps. Each screen gets a spec in `docs/frontend/screens/` *before* it is built.
2. **Design system before screens.** Tokens and components are defined once (`docs/frontend/01-design-foundations.md`) and reused.
3. **Full build, then polish.** *(Owner directive 2026-10-27, decision #26.)* The remaining MVP screens are built end-to-end first; the owner reviews the complete app, then a polish pass tunes copy, layout and feel.
4. **Ideas are never lost.** Anything not needed yet goes into the roadmap with a tier (Now / Next / Later), not into the code.

## Index

### Product
- [01 Vision and positioning](product/01-vision-and-positioning.md)
- [02 Roadmap](product/02-roadmap.md)
- [03 Content and legal guardrails](product/03-content-and-legal-guardrails.md)

### Blueprint (master plan, draft v1: approve before building)
- [00 Master blueprint](blueprint/00-master-blueprint.md)
- [01 Feature spec](blueprint/01-feature-spec.md)
- [02 Screens spec](blueprint/02-screens-spec.md)
- [03 Data model](blueprint/03-data-model.md)
- [04 System design](blueprint/04-system-design.md)
- [05 Security and privacy](blueprint/05-security-privacy.md)
- [06 Content and reviewers](blueprint/06-content-and-reviewers.md)
- [07 Quality, analytics, launch](blueprint/07-quality-ops.md)
- [08 Build plan and decisions](blueprint/08-build-plan-and-open-questions.md)
- [09 Own PDF viewer, page detection, page mapping](blueprint/09-pdf-viewer-spec.md)
- [10 Architecture spec v1.0 (LOCKED)](blueprint/10-architecture-spec-v1.md)
- [11 Spec → codebase mapping + phased kickoff](blueprint/11-architecture-mapping.md)
- [12 Study-section spec v1.0 (Planning)](blueprint/12-study-section-spec-v1.md)
- [13 Study spec → codebase audit & mapping](blueprint/13-study-section-mapping.md)

### Frontend
- [01 Design foundations](frontend/01-design-foundations.md)
- Screens
  - [01 Landing page](frontend/screens/01-landing.md) (built)
  - [01b Landing page, launch edition](frontend/screens/01b-landing-launch-edition.md) (spec only, not built)
  - 02 Sign in and onboarding (next)
  - [03 App shell (P1) + Home dashboard (P2)](frontend/screens/03-home-dashboard.md) (built)
  - 04 Library (merged into Study hub)
  - 05 Study workspace (the core screen)
  - 06 Chapter test and results
  - 07 Progress (minimal real page built)
  - 08 Bookmarks (minimal real page built)
  - 09 Settings
  - 10 Reviewer console

### Architecture
- [01 Tech stack](architecture/01-tech-stack.md)

### Ops
- [01 Deploy on Vercel](ops/01-deploy-vercel.md)
- [02 Waitlist with Google Apps Script](ops/02-waitlist-apps-script.md)

### Decisions
- [Decision log](decisions.md)

## Build log

| Date | Step | Notes |
|---|---|---|
| 2026-10-24 | Planning + Landing page | Vision, roadmap, design foundations, landing spec and build. Static, no backend. |
| 2026-10-25 | Contrast audit and fixes | Added `scripts/check-contrast.py`. Fixed input-border, dark-hover and streak-chip contrast and the phone header overflow. Wrote the launch-edition landing spec (01b). |
| 2026-10-25 | Master blueprint v1.0 | Feature, screen, data, system, security, content, QA specs and open decisions. Build paused until approved. |
| 2026-10-25 | Blueprint approved + PDF viewer spec (doc 09) | Owner accepted all recommendations; own PDF.js viewer chosen; decisions 18–21 logged. |
| 2026-10-25 | M2 app shell (first cut) | Email magic-link sign-in, onboarding, signed-in shell (Home, Library, Settings), proxy route protection, Supabase clients, Vercel env set. Google sign-in pending. |
| 2026-10-26 | Study workspace (M3 first real cut) | `/study/[chapter]`: own PDF.js viewer + page detection + printed labels, Practice this page (focus/list), attempts, bookmarks and reading progress saved, signed-URL PDF from private bucket, admin upload. Dev sample questions only. |
| 2026-10-26 | Question import + review + DB-backed practice | Admin import of the owner's page files with validation, `/review` publish workflow, five question types in the workspace, library counts. All 9 files (171 questions) of the owner's bank validate. |
| 2026-10-27 | Owner replan (decisions 26–32) | Questions source moved to `juyel-dev/neet-pcb-question-bank`; Google-only auth; guest mode (per page first 2 questions, saves need sign-in, "Continue as guest" entry, no guest onboarding); separate admin app next; landing mock removed; NCERT permission attested (release gate open). NCERT permissions recorded in `docs/legal/ncert-permission.md`. |
| 2026-10-28 | Landing app-open edition live | Mock removed earlier; `NEXT_PUBLIC_APP_OPEN=true` switches landing to Google/guest CTAs; production domain renamed to `neet-aspirants.vercel.app`. |
| 2026-10-28 | **Architecture spec v1.0 LOCKED** (decision 33) | Owner's locked spec saved as `blueprint/10`; codebase mapping + phased kickoff as `blueprint/11`. No implementation started (spec §14) — awaiting owner approval of the phase order. |
| 2026-10-28 | Mock pages 1–3 shipped (decision 34 palette) | Landing minimal hero (indigo-blue tokens, Google CTA, book SVG); `/start` 3-slide onboarding carousel; `/sign-in` centered card; `/legal/terms` + `/legal/privacy` stubs; old landing sections removed. Checks: typecheck/lint/tests 18✓/build ✓, contrast 39/39. |
| 2026-10-28 | **Migration 0006 applied to production** (owner approved) | Guest RLS policies live (anon SELECT: books, page_map, content_releases, live chapters, published questions, current versions; signed-URL policy for chapter PDFs). Verified: migration history `20261028105149`; anon REST calls return 200. Note: production library is empty by design until chapters are set `live` (both current chapters are `draft`, no PDFs, 0 questions imported). |
| 2026-10-28 | **First chapter PDF uploaded** | `The Living World` (class11-bio-ch01): NCERT Class 11 Biology Ch-1 PDF (2.26 MB) uploaded to `chapter-pdfs/class11-bio-ch01.pdf` via service-role REST (owner-provided key; stored in local credentials.env, never in repo). Chapter row: pdf_path + sha256 `e6b49c5e…77fd` + page_count 9. Status stays `draft`; page_map 0 rows, questions 0. |
| 2026-10-28 | **Ch-01 content imported from questions repo; chapter live** | 9 page files from `juyel-dev/neet-pcb-question-bank` validated with a faithful port of `validatePageFile`/`importPageFile` → 171 questions (`in_review`, v1 payloads, source_note `kebo101.pdf, PDF page N`), 9 page_map rows (2 unit_intro + 7 content), 9 audit_log rows (actor: Juyel-dev). Chapter set `live`. Guest end-to-end verified via anon REST: chapter visible, PDF signed URL serves exact bytes (2,263,862 B, %PDF-1.6), in_review questions hidden. |
| 2026-10-28 | **All 171 Ch-01 questions published (owner approved)** | `in_review → published` (owner's call, questions pre-verified `reviewed_against_source`). Guest check: 171 published questions visible via anon REST, per-page 24/12/15/20/20/20/20/20/20; guests still see only the first 2 per page in the UI (decision 29). First fully readable + practisable chapter is live in production. |
| 2026-10-30 | **Study spec v1.0 implemented — first build pass** (decisions 35–36) | `/study` hub: Subject × Class chips (URL `?subject=&class=`, saved to `profiles.prefs` for signed-in), Continue Studying, Recent Chapters, per-chapter progress bars + attempt/correct stats, honest empty states (only Biology · 11 has published content), draft chips for staff. `/library` now redirects to `/study` (old links intact); nav shows Home · Study · Settings; all `/library` links migrated. Viewer: "Dark pages" → "Invert pages" (opt-in), upload dedupe via stored `pdf_sha256` (decision 36c). Hub helpers pure + tested (`hub.test.ts`: selection/progress/attempt-latest-wins). Checks: typecheck ✓ lint ✓ tests 30✓/2 skip ✓ build ✓. Pending content for steps 8–10: Day/Night verification matrix needs Physics/Chemistry PDFs; three-subject E2E as content lands. |
| 2026-10-30 | **P1 shell + P2 Home built — mock frame 4 with real data** (decision 37, owner-approved kick-off) | Dark sidebar (`.dark` token island — no new tokens) + `src/config/nav.ts` registry + mobile drawer; top-bar search/bell omitted honestly (no backend). `/home`: greeting (Asia/Dhaka time), 4 real stat tiles (chapters/pages seen/questions attempted/accuracy), Continue Studying card, Recent Chapters rows, Quick Actions, SVG completion ring, Today's Goal from `daily_goal` + `daily_stats`, quote card. Companion routes so the shell has no dead ends: `/practice` (real chapter list + honest "tests later" note), `/progress` (daily_stats 30-day table), `/bookmarks` (real saved-question → page links). Old `AppNav` retired; guest variant keeps Home/Study only. Checks: typecheck ✓ lint ✓ tests 30✓/2 skip ✓ build ✓ (routes `/practice /progress /bookmarks` PPR). |
| 2026-10-30 | **Study-section spec v1.0 received (Planning)** (decision 35) | Owner's Study spec saved verbatim as `blueprint/12`; §12 step-1 audit done and mapped against the codebase as `blueprint/13` — most of the stack already exists (pdf.js viewer, per-page questions, progress tables, storage+RLS); new work = Subject→Class selection, study dashboard, printed-label/pass. No code, repo or DB changes made — awaiting owner approval. |
| 2026-10-31 | **Ch-02 content imported — Biological Classification (`draft`, ready for owner review)** | 13 page files (unit-01 → chapter-02) from `juyel-dev/neet-pcb-question-bank` validated + imported through the faithful pipeline port → **232 questions** `in_review` (v1 payloads, `source_note` `kebo102.pdf, PDF page N`; per-page 13/18/16/17/19/19/19/18/22/18/18/20/15 = 232), 13 `page_map` rows (all `content`, printed labels 1–13), 13 `audit_log` rows (actor Juyel-dev), 0 unlinked version pointers. Chapter row created (`class11-bio-ch02`, unit 1 · Diversity in the Living World, no dupes against existing slugs/sha). NCERT `kebo102.pdf` (3.29 MB, `%PDF-1.6`, pypdf reports 13 pages = JSON alignment OK) uploaded to `chapter-pdfs/class11-bio-ch02.pdf` via storage REST; `pdf_sha256` `7952d430…36c9` + `page_count` 13 stored (decision 36c dedupe check ran — no other chapter holds this sha). Signed-URL serves exact bytes. Status stays `draft` (supabase-verified); chapter publish + question publish remain the owner's calls. |

