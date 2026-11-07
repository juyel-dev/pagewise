# Build-ready spec pack

**Purpose.** A developer or an AI agent should be able to build any screen from this folder **without making a single product or design decision**. If something is not written here, it is not decided yet.

**Why it exists (2026-11-07).** The earlier docs say *what* the product is and *how* the system is built, but not, screen by screen, which elements exist, how they look and behave, how they relate, and in what order to build them. That gap makes code the place where decisions get made. This pack closes it.

**Visual source of truth:** `docs/walkthrough/` (decision 49). Each screen spec here defines behaviour, keys, analytics and tests; the matching walkthrough page defines how it looks, element by element. Where they differ, the walkthrough wins.

## Rules

1. **Spec first.** A screen is built only when its spec status is **Ready** (owner has read it). Code PRs link the spec file.
2. **Stop, don't invent.** If the spec is silent or unclear, add an entry under the screen's *Open questions*, ask the owner, then continue. Never decide in code.
3. **One source per fact.** Colours, type, spacing and motion live in `docs/frontend/01-design-foundations.md` §2–5 and are *referenced*, never copied. Data shapes live in `blueprint/03-data-model.md` and `supabase/migrations/`. Product rules live in `decisions.md`.
4. **Spec changes go through a PR** that edits the spec *before* the code, and updates the change log at the bottom of that spec.
5. **Done means every acceptance test in the spec passes** plus the Definition of Done in `blueprint/17` §4.

## Contents

| File | What it fixes |
|---|---|
| `01-design-language.md` | How the product looks and feels beyond tokens: layout recipes, density, iconography, motion, z-index, "feel" rules |
| `02-components.md` | Every reusable component: anatomy, props, variants, states, accessibility |
| `03-navigation-and-relations.md` | Route map, access rules, screen-to-screen graph, entity relations |
| `04-data-contracts.md` | What each screen reads and writes, errors, caching |
| `screens/_TEMPLATE.md` | Fixed outline every screen spec follows |
| `screens/S05-study-workspace.md` | First complete screen spec (the core screen) |

## Screen register

Status: **Ready** (owner-read) · **Draft** (written, awaiting owner) · **Thin** (exists but not build-ready) · **To write**

| ID | Screen | Route | Spec | Status |
|---|---|---|---|---|
| S01 | Landing | `/` | `frontend/screens/01-landing.md` | Thin |
| S02 | Start carousel | `/start` | — | To write |
| S03 | Sign in | `/sign-in` | — | To write |
| S04 | Onboarding | `/onboarding` | — | To write |
| **S05** | **Study workspace** | `/study/[chapter]` | `screens/S05-study-workspace.md` | **Ready** |
| S06 | Study hub | `/study` | — | To write |
| S07 | Home | `/home` | `frontend/screens/03-home-dashboard.md` | Thin |
| S08 | Practice hub | `/practice` | — | To write |
| S09 | Chapter test (setup, run, result) | `/practice/test/...` | — | To write |
| S10 | Review session (spaced repetition) | `/practice/review` | — | To write |
| S11 | Progress | `/progress` | — | To write |
| S12 | Bookmarks | `/bookmarks` | — | To write |
| S13 | Settings | `/settings` | — | To write |
| S14 | Search / command menu | overlay | — | To write |
| S15 | Legal | `/legal/[doc]` | — | To write |
| S16 | System pages (error, 404, offline, loading) | global | — | To write |
| A01–A09 | Admin console (sign-in + TOTP, dashboard, review queue, import, chapters/PDFs, page maps, reports, users/roles, audit log) | `apps/admin` | `blueprint/18` (needs screen-level specs) | Thin |

Writing order: S05 → S06 → S07 → S03/S04 → S11/S12/S13 → S08–S10 → S14–S16 → A01–A09 → S01/S02.

## Reference artefact

The Design canvas (https://claude.ai/artifact/SMz7j3fnYK5YpwNJP3wmtd) shows layout for most screens. It is **reference only**: where it disagrees with this pack or `decisions.md`, this pack wins (known deviations: `blueprint/14` §13).

## Known gaps (honest list, 2026-11-07)

An independent developer can build S05's behaviour from this pack without product decisions, but these gaps remain and must be closed before the pack is called complete:
1. **Visual spec per element** (spacing, type role, token, icon name, radius for each element in each state). Today the pack gives layout, sizes of regions and state semantics, not every pixel.
2. **High-fidelity reference boards** built with the repo's real tokens (the current canvas uses different colours).
3. **Developer onboarding** (`docs/dev/`): how to run, env variables, test data, branch and PR conventions, definition of done checklist.
4. **Test fixtures**: a seeded dataset of chapters, pages and questions covering every question type and edge case.
5. **Remaining screens** (all "To write" rows above).
