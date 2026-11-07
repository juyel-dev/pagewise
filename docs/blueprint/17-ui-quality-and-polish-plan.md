# Blueprint · 17 · UI quality and the polish pass

**Status:** Proposed. Implements decision 26 ("full build first, then polish") for horizon H2.
**Trigger:** owner review of the live site on 2026-11-07: the whole UI feels poor quality and slow. Part of the slowness was infrastructure (compute was in the US, database in Mumbai) and is fixed; the rest is design and front-end work planned here.

## 1. Order of work

1. **Speed first.** A fast ugly page beats a slow pretty one. H1 removes the known costs (doc 16 §2) before any restyling.
2. **Then feel.** Layout, type, spacing, motion, empty/loading/error states.
3. **Then polish per screen** against its checklist (§4), one screen at a time, owner sign-off each.

## 2. Reference material and its limits

- Existing: `docs/frontend/01-design-foundations.md`, audits `02`, `03`, `04`, and screen specs in `docs/frontend/screens/`.
- Design canvas (Claude artifact, 37+ boards: desktop, mobile, dark, admin, states): https://claude.ai/artifact/SMz7j3fnYK5YpwNJP3wmtd. **Layout reference only.** It uses its own colours, shows email sign-in (not allowed, decision 27) and contains sample numbers (decision 13). Where canvas and repo disagree, the repo's tokens and decisions win (`14` §13).
- Rule: a screen is rebuilt only after its spec in `docs/frontend/screens/` is updated from the canvas.

## 3. Quality principles

1. **Study first.** The workspace is the product; every other screen exists to get a student into it faster.
2. **One obvious next action** per screen (primary button), everything else secondary.
3. **Calm density.** Plenty of whitespace around questions and the PDF, tight chrome around them.
4. **Honest states.** Every list has empty, loading (skeleton), error and offline states; no fake data (decision 13).
5. **Keyboard and touch are both first-class**: shortcuts on desktop, ≥ 44 px targets and thumb-reachable actions on phones.
6. **Perceived speed**: skeletons that match final layout, optimistic answer feedback, no layout shift.
7. **One design language**: tokens only, no one-off colours; both themes machine-checked for contrast.

## 4. Definition of done for any screen

- [ ] Spec in `docs/frontend/screens/NN-name.md` is current
- [ ] Renders correctly at 360, 768 and 1280 px, light and dark
- [ ] Empty, loading, error, offline states exist and are tested
- [ ] Keyboard: every action reachable, visible focus, logical order; screen-reader names on controls
- [ ] Contrast script passes; no new colour outside tokens
- [ ] Performance budget (doc 16 §2) met on the preview URL
- [ ] No hard-coded user-visible sentence once the i18n catalogue exists
- [ ] Component test or Playwright check for the main flow
- [ ] Owner has looked at it on a real phone and a laptop

## 5. Screen order for the polish pass

1. Study workspace (desktop, then phone layout with tabbed Read / Practise)
2. Study hub and chapter cards
3. Home
4. Sign-in, start carousel, landing
5. Practice, Progress, Bookmarks, Settings
6. Shared states: error, 404, loading, offline, toasts, dialogs

## 6. Component inventory (build once, reuse everywhere)

Button, IconButton, Chip, SegmentedControl, Card, ProgressBar and Ring, Input, Switch, Dialog, Sheet (mobile), Toast, Skeleton, EmptyState, StatusPage (exists), Tabs, Tooltip, QuestionCard (types: MCQ, assertion–reason, statement, match), PageChipRail, SplitPane, PdfToolbar, ThumbnailStrip. Each lives in `components/ui/` with a short usage note; features compose them.

## 7. Measurement

- Lighthouse CI on every preview (performance, accessibility, best practices) with the budgets in doc 16.
- Playwright timing for "first usable workspace".
- A recorded before/after for each polished screen in `docs/frontend/` so progress is visible.
