# 04 · Two-year plan (Nov 2026 → Nov 2028)

**Status:** Adopted 2026-11-07 (decision 46). **How to read it:** the roadmap (`02-roadmap.md`) says *what* and *in which tier*; this doc says *in which order, with what exit test*. Quarters are **planning guesses**, re-baselined at every horizon exit. A horizon ends when its exit criteria pass, not when the calendar says so.

## 1. The critical path is content, not code

Claude writes the code. The things that gate a launch are slower and mostly owner-side:

| Gate | Why it blocks | Who handles it |
|---|---|---|
| Question bank throughput | A chapter is only useful with questions and a page map | **Owner** writes the questions and decides review and quality (decision 48); the admin app only has to make import and publish easy |
| NCERT permission | Hosting PDFs needs authorization | **Owner** is handling it; the granted permission is handed over **on the day before production** and recorded in `docs/legal/ncert-permission.md` (decision 48) |
| Legal review (DPDP, under-18 users) | Launch gate in doc 15 §6 | **Owner** is handling it; work is already in progress |
| Beta students | Real feedback is the only honest quality test | Owner recruits before H3 |

Claude's side of the critical path: be ready (plans, specs, code, tests, tooling) so none of these gates wait on engineering.

Rule: code never runs ahead of content by more than one horizon.

## 2. Horizons

Each row: **goal → deliverables → exit criteria.** Technical phases `F0–F6` are in `blueprint/14`; product phases `A–E` are in `blueprint/01`.

| # | When (guess) | Goal | Deliverables | Exit criteria |
|---|---|---|---|---|
| H0 | Nov 2026 | Safe foundation | F0 plan, F1 monorepo, F2 hardening (server grading, headers, env), Mumbai region, all plans written | CI green, production on `bom1`, docs 14–19 merged |
| H1 | Dec 2026 – Jan 2027 | Trustworthy core | F3 `apps/admin` (`pagewise-admin.vercel.app`), F4 workspace refactor + PDF speed, Sentry, Playwright smoke tests, rate limiting | Staff routes gone from web; workspace file < 200 lines per unit; first-load budgets met (doc 16) |
| H2 | Feb – Mar 2027 | The polish pass (decision 26) | F5 UI rebuild per doc 17, mobile-first workspace, dark mode, i18n catalogue scaffold | Owner signs off every screen against its checklist; contrast 100%; Lighthouse budgets met |
| H3 | Apr – Jun 2027 | Closed beta (phase A) | Bio 11 complete, Bio 12 started, report-a-question loop, PWA install, cookieless analytics, parental-consent design | 20–50 invited students; weekly feedback review; no data-loss bugs for 4 weeks |
| H4 | Jul – Sep 2027 | Public launch (phase B) | Separate production Supabase project, custom domain, legal pages reviewed, chapter tests, spaced-repetition review queue, status page, support inbox | All launch gates in doc 15 §6 pass |
| H5 | Oct – Dec 2027 | Depth (phase C) | Mistake notebook, notes and highlights, progress analytics, Hindi and Bengali, reminders | Retention measured; second language live |
| H6 | Jan – Jun 2028 | Breadth (phase D) | Physics then Chemistry, full-length mock tests, more languages, reviewer community and credits | Three subjects live with reviewed content |
| H7 | Jul – Nov 2028 | Scale and revenue (phase E) | Optional premium, teacher/coaching dashboards, offline app (TWA), public SEO pages from our own content | Sustainable running costs; plan for year 3 written |

## 3. What we deliberately do not do

- No per-user AI generation (decision, cost and accuracy). A grounded tutor is a **later** item and needs its own spec.
- No third-party ad or tracking pixels (decision 14).
- No feature without a mini-spec first (spec §13). No screen without its spec in `docs/frontend/screens/`.
- No framework or tool swap without a decision-log entry.

## 4. Risk register (reviewed at every horizon exit)

| Risk | Likelihood | Impact | Response |
|---|---|---|---|
| Content slower than code | High | High | Owner-produced; make import and publish in the admin app fast; keep code from outrunning content by more than one horizon |
| NCERT permission arrives late or with narrower scope | Low | Very high | Owner-managed; PDFs stay in private storage; a launch gate; app can launch with deep links as fallback (doc 09) |
| Solo bandwidth | High | Medium | Small PRs, written plans, this doc as the single source of order |
| Free-tier limits hit by growth | Medium | Medium | Thresholds and upgrade triggers in doc 16 |
| Under-18 data compliance | Medium | Very high | Owner's legal work in progress; data minimisation now; consent flow built to the lawyer's advice before H4 |
| Quality regressions from fast AI-assisted changes | Medium | High | CI gates, tests with every fix, boundaries enforced by lint (doc 14) |

## 5. Review cadence

- **Per PR:** update `docs/status.md` if the state changed.
- **Per horizon exit:** re-baseline dates, re-read the risk register, write the next horizon's mini-specs *before* coding it.
- **Quarterly:** check cost and limits (doc 16 §5).
