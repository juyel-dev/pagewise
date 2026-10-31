# Blueprint · 13 · Study-section spec v1.0 → codebase audit & mapping

Companion to `12-study-section-spec-v1.md` (owner, 2026-10-30, status Planning).
This is the audit the spec's §12 step 1 asks for, done **before implementation and before approval** — no code has been changed. It maps what exists (to reuse), what is missing (to build), and proposes answers to the spec's own open points. **Approval of this document by the owner is required before any implementation** (spec rule + change control §15).

Date of audit: 2026-10-30 (post commit of pages 1–3 + ch-01 live content).

## 1. Spec § → current implementation (verbatim audit)

| Spec § | Requirement | Current state | Verdict |
|---|---|---|---|
| §2 Subjects | Biology / Physics / Chemistry | `books` table has `subject` + `class` columns (0001); only **one book row exists** (Class 11 Biology). No UI for subject choice. | 🟡 schema ready, UI + other books' rows needed |
| §3 Flow | Home → Study → Subject → Class → Chapter → Dashboard | Today: `/home` … `/library` (flat chapter list grouped by class, Biology copy hardcoded) → `/study/[slug]` workspace. Nav: Home / Library / Settings. | 🟡 chapter→workspace solid; **Subject/Class selection layer missing** |
| §4 Dashboard | per subject+class: identity, chapter list, Continue Studying, Recent Chapters, progress, shortcuts | Storyboard reference noted. Nothing built here; data for it **already exists**: `reading_progress` (last_page, pages_seen), `attempts`, `bookmarks`, `daily_stats` (all user-keyed, RLS'ed). | 🆕 build (data layer free) |
| §5 Viewer | custom PDF viewer, prev/next, page x/y, loading/error states, day/night, page tracking, printed-page mapping, responsive | EXISTS: `src/components/viewer/pdf-viewer.tsx` (pdf.js-based, not an iframe) with `pdfv-dark` night pages, zoom, `onPageChange`, `onReady/onError`, `scrollToPage` handle — the workspace (`src/features/study/study-workspace.tsx`) wires navigation, `numPages`, current page, progress saves. Printed-page map: `page_map` table with `printed_label`, `kind` (0001+0005); display in UI needs a verification pass. | ✅ largely reuse; small verification/completion pass |
| §6 Page questions | per-page reviewed questions, MCQ options/answer/explanation, panel follows page, empty state | EXISTS end to end: `questions` (chapter_id, pdf_page, status `published`) + `question_versions` payload; workspace filters by current page, panel updates on page change, question types incl. match/assertion (0005), empty state present; 171 live questions prove the pipeline. Guest limit: first 2 per page (decisions 28–29). | ✅ reuse (with sign-in gating per decision 28) |
| §7 Progress | subject/class, last chapter/page, chapter progress, attempts, correct/wrong counts, last read | Server-side EXISTS: `reading_progress` upsert (page + pages_seen), `attempts` (chosen, is_correct, time_ms), `daily_stats`. Sign-in required (decision 28). Guest persistence: spec asks to decide **before implementation** → proposal in §3 of this doc. | ✅ data layer reuse; decision needed for guests |
| §8 Data architecture | subjects, classes, chapters, PDFs, page mappings, questions, progress, attempts — isolated per chapter | All entities exist and are chapter/subject-scoped; chapter content changes cannot touch other subjects (separate rows). Subject isolation is by `books.subject`. | ✅ reuse |
| §9 Storage & access | central private storage, path on chapter, server-side access, no re-upload | EXISTS: private `chapter-pdfs` bucket (0003), `pdf_path` + `pdf_sha256` + `page_count` on chapter, signed-URL via server (3600s), storage RLS = live-only read for students/anon, admin write. Proven live with ch-01 (exact-bytes guest verification 2026-10-28). Dedupe: `pdf_sha256` is stored; check-before-upload needs a one-line addition to the admin upload path. | ✅ reuse (+ tiny dedupe check) |
| §10 Day/Night | define PDF-page color behaviour, verify readability | Viewer already has a dark-pages path (`pdfv-dark`); global tokens switch light/dark (contrast-checked). Needs: explicit test matrix across real acid/base diagrams and physics equations + a decision whether night mode inverts pages or only surrounding UI (proposal in §3). | 🟡 verify + decide |
| §11 Responsive | desktop side-by-side; mobile stacked/panel switching | Workspace already renders viewer + question list; side-by-side and stacked behaviour needs a mobile polish pass (no architecture change). | 🟡 small polish |
| §14 Out of scope | Home full build, leaderboard, sponsors, AI gen, redesign | Matches the current plan; Home stays minimal until its own phase. | ✅ consistent |

## 2. What must be built for this spec (and only this)

1. **Subject → Class → Chapter selection** (spec §2–3): a Study section route structure (e.g. `/study` hub → subject & class filter/chips → chapter grid). No iframe of choices; plain pages using existing `books`/`chapters`.
2. **Study Dashboard** (§4): per subject+class panel above the chapter list — Continue Studying, Recent Chapters, completion %, shortcuts. Backed by tables that already exist.
3. **Viewer completion pass** (§5): printed-label display from `page_map` verify, loading/error polish — no rewrite of the pdf.js viewer.
4. **Mobile/panel-switching polish** (§11) + **Day/Night verification matrix** (§10).
5. **Upload dedupe check** (§9): reject a re-upload whose sha256 matches the stored one (admin flow).
6. **Seed data rows** for Physics/Chemistry + Class 12 books **as content arrives** (content-ops, not code).

Explicitly **not needed**: any new schema for subjects/questions/progress (0001–0005 already carry them), no rewrite of the guest mode, no Home work.

## 3. Proposed answers to the spec's open points (**APPROVED by owner 2026-10-30**)

| Open point | Proposal | Why |
|---|---|---|
| §7 guest progress | Guests get **session-only** continuation (kept in client memory for the visit), zero DB writes; sign-in banner prompts to keep progress. Server saving for signed-in users exactly as today. | Consistent with locked decisions 28–29 ("saves need sign-in"); no schema or RLS change |
| §10 night mode in areas of dark text | Default: **surrounding UI** follows Day/Night; the PDF canvas keeps its original colors, with the existing dark-page surface dimmed (try both with the new inverse test) — pick after the verification matrix in §12 step 8; if inversion harms figures/equations, ship UI-only night mode. | Spec explicitly allows this option; readability-first |
| §9 duplicate uploads | Compare sha256 before upload: same hash + same chapter → reject with a clear message; different file → normal upsert path. | No schema change; protects storage |
| §3 flow entry | "Study" nav item added between Home and Library (nav registry pattern from architecture mapping); `/library` either becomes the Study hub or redirects — decide at build time without breaking existing URLs (`/study/[slug]` chapter URLs unchanged). | Spec flow, plus existing link stability |

## 4. Relationship to the locked architecture spec (blueprint/10) and phase order (blueprint/11)

- This spec is a **feature-level plan under architecture spec §3/§7** — it does not change the locked architecture; Home isolates, viewer isolates from Home, shared components reused (§8).
- blueprint/11's P1 (sidebar shell) / P2 (Home system) are **deferred** by the owner's Study-first steer; nothing in the locked spec blocks this (phase order was always "needs owner approval"). The Study build rides the existing top-bar shell — the sidebar shell can come later as its own approved phase.
- Change control: any deviation needs a logged reason/impact/alternative/proposal per spec §15 and architecture §13.

## 5. Build order (owner's §12 mapped onto reuse)

| §12 step | Reuse / build |
|---|---|
| 1 Audit | ✅ this document |
| 2 Selection UI 🆕 | `/study` hub: subject chips (Biology/Physics/Chemistry) × class tabs (11/12) → chapter cards |
| 3 Data access | ✅ reuse `load.ts` pattern + books join; seed book rows as content lands |
| 4 Viewer & nav | ✅ reuse pdf-viewer + workspace nav; replace only gaps |
| 5 Printed mapping | ✅ reuse `page_map`; add UI verification (label on page indicator) |
| 6 Question panel | ✅ reuse workspace panel (+ guest limit intact) |
| 7 Progress tracking | ✅ reuse saves (sign-in gated) + new dashboard readouts; guests = session-only per §3 proposal |
| 8 Day/Night | 🟡 verification matrix (bio/phy/chem figures, equations) then final behaviour |
| 9–10 Testing | desktop + mobile pass; three subjects end-to-end (content-permitting) |

**Where content is thin** (only Biology Class 11 exists today), the UI must show honest empty states for other subjects, not fake data (truth-in-copy rule).

## 6. Build status — first pass complete (2026-10-30)

- §5 rows 2–7 done: `/study` hub (subject×class chips with URL params + `profiles.prefs` save via `setStudyPrefs`), Continue Studying, Recent Chapters, per-chapter progress/attempt stats, honest empty states; `/library` → redirects to `/study`; nav + all links migrated; "Invert pages" label; upload dedupe (`pdf_sha256` compare, ruling (c)).
- Guest rulings intact: no DB writes for guests (36a); the hub's guest banner offers sign-in only.
- Content (2026-10-31): Ch-02 `Biological Classification` published — 232 questions + NCERT PDF (13 pages) live, chapter `live` (owner approved the publish pass). Biology · 11 now has 2 fully live chapters (171 + 232 published questions); PDFs for Physics/Chemistry remain the §12 steps 9–10 unlock.
- Pending: §10 Day/Night verification matrix and steps 9–10 (desktop/mobile + three-subject E2E) need Physics/Chemistry content to be meaningful.
