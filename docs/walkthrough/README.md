# Walkthrough — the finished app, page by page

**What this is.** A walk through the *finished* Pagewise as a student would see it: open the link, press every button, scroll every page from the very top to the very bottom. For each page it records, in order, every element, how it looks, what it says, and where each click goes.

**Authority.** Owner granted full freedom on 2026-11-07 to override earlier specs and decisions (decision 49). **Where a walkthrough page disagrees with `docs/spec/screens/*`, `docs/frontend/screens/*` or the Design canvas, the walkthrough wins.** Behaviour detail that a walkthrough page does not repeat (keyboard map, analytics, acceptance tests) stays in `docs/spec/`.

**How to read a page.** Each page file has: (1) a one-paragraph picture of the page; (2) wireframes for desktop and phone; (3) **top-to-bottom sections**, each with an element table in visual order; (4) states; (5) colour, type and i18n notes; (6) where every click goes.

## Element table notation

`E#` · **Component** · "exact copy" · *style* · → behaviour / destination

Style shorthand: `bg:` fill token · `b:` border · `r:` radius px · `p:` padding px · `gap:` · `type:` role from `00-tour.md` §3 · `ink/ink-2/muted` text tokens · `sh:` shadow token. Tokens are the repo's real ones (`docs/frontend/01-design-foundations.md`).

## Pages

| # | File | Page | Status |
|---|---|---|---|
| 00 | `00-tour.md` | Global shell, type roles, site map, visitor journeys | Draft |
| 01 | `01-landing.md` | Landing `/` | Draft |
| 02 | `02-sign-in.md` | Sign in `/sign-in` | Draft |
| 03 | `03-onboarding.md` | Onboarding `/onboarding` | Draft |
| 04 | `04-home.md` | Home `/home` | Draft |
| 05 | `05-study-hub.md` | Study hub `/study` | Draft |
| 06 | `06-study-workspace.md` | Study workspace `/study/[chapter]` | Draft |
| 07 | `07-practice.md` | Practice hub, setup, session (quick/test), result, review queue | Draft |
| 08 | `08-progress-bookmarks-settings.md` | Progress, Bookmarks (+ missed), Settings (4 tabs) | Draft |
| 09 | `09-search-help-legal-system.md` | Search palette, Help, Legal (3), System pages | Draft |
| 10 | — | Admin console (9 screens) | To write |
