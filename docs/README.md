# PageWise documentation

Planning is the product. These docs are written **before** each build step so the app stays coherent as it grows.

## How we build

1. **Frontend first**, screen by screen, in small steps. Each screen gets a spec in `docs/frontend/screens/` *before* it is built.
2. **Design system before screens.** Tokens and components are defined once (`docs/frontend/01-design-foundations.md`) and reused.
3. **Ship small, review, adjust.** The owner reviews the live app after every step; colours, copy and layout are expected to change.
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

### Frontend
- [01 Design foundations](frontend/01-design-foundations.md)
- Screens
  - [01 Landing page](frontend/screens/01-landing.md) (built)
  - [01b Landing page, launch edition](frontend/screens/01b-landing-launch-edition.md) (spec only, not built)
  - 02 Sign in and onboarding (next)
  - 03 Home / dashboard
  - 04 Library (chapter picker)
  - 05 Study workspace (the core screen)
  - 06 Chapter test and results
  - 07 Progress
  - 08 Bookmarks and mistake notebook
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

