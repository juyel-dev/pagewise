# Blueprint · 07 · Quality, analytics, SEO and launch

## 1. Test strategy

| Layer | Tooling | What |
|---|---|---|
| Unit | Vitest | Content schema validators, scoring, accuracy math, page navigation logic, markup parser |
| Component | Vitest + Testing Library | Question renderers (all types), divider, navigator |
| Database | pgTAP or SQL tests via Supabase CLI | RLS for every table/role, deletion cascade, report threshold trigger |
| E2E | Playwright | Sign-in (mocked IdP), onboarding, open chapter, answer, bookmark, report, offline queue, reviewer approve/publish |
| Accessibility | axe in Playwright + manual screen-reader pass | Zero serious/critical; keyboard-only walkthrough of every P0 flow |
| Visual | Playwright screenshots light/dark × 3 widths | Catch regressions on tokens |
| Content | `validate-content` script | Schemas, duplicate detection, page coverage report |
| Performance | Lighthouse CI + bundle budget | Doc 04 §7 budgets |
| Load | k6 | Auth + attempts + manifest/chapter fetch at 5× expected peak |
| Cross-browser | Chrome, Edge, Firefox, Safari, Android Chrome, iOS Safari | Embed spike matrix repeated each quarter |

## 2. Accessibility requirements

WCAG 2.2 AA. Specific: visible focus on every control; roving tabindex in option groups; `aria-live` polite for check results; colour never the only signal; target size ≥ 24 px (44 px on touch); respects `prefers-reduced-motion` and `prefers-color-scheme`; page language attribute per locale; skip-to-content link; divider has `role="separator"` with value and keyboard support; match-the-column has a non-drag path; PDF fallback card readable by screen readers. Contrast enforced by `scripts/check-contrast.py` in CI.

## 3. Analytics event catalogue

Cookieless, aggregated, no free text, no minors' behavioural profiling. Core events: `landing_viewed`, `waitlist_submitted`, `sign_in_started/completed`, `onboarding_completed`, `home_viewed`, `resume_clicked`, `chapter_opened`, `workspace_opened`, `page_changed`, `mode_changed`, `question_answered`, `source_link_clicked`, `ncert_embed_failed`, `bookmark_toggled`, `report_submitted`, `goal_reached`, `settings_changed`, `account_deleted`. Reviewer events are internal only.

**Product metrics:** activation (≥5 answers in first session), D1/D7/D30 retention, questions per active day, chapter completion, embed failure rate by browser, report rate per 1,000 answers, reviewer throughput, time to first question (target < 60 s from sign-in).

## 4. Observability

Sentry (errors, release tagging, source maps), Vercel analytics for web vitals, Supabase logs and alerts (error rate, slow queries, connection saturation), uptime monitor on `/`, `/api/health`, manifest URL. Alert routing to owner email/phone; weekly digest.

## 5. SEO and sharing

Public pages only: landing, about, privacy, terms, contributors. Structured data (`Organization`, `WebSite`), canonical URLs, sitemap, `robots.txt` blocking `/review`, `/admin`, app routes. OG image per page (exists for landing). Later (phase E): public topic pages built from our own content, not NCERT text.

## 6. Release process

Trunk-based with short branches; preview per PR; changelog entry per user-visible change; semantic content releases (`YYYY.MM.n`); feature flags for risky releases; production deploy only from `main` after CI green; post-deploy smoke test; rollback = Vercel instant rollback + content manifest pointer.

## 7. Support and feedback

In-app "Send feedback" (opens email or form), public status note, response target 48 h, tagged inbox (content error, bug, account, privacy). Privacy requests answered within the statutory timeline.

## 8. Launch checklists

**Closed beta (phase A):**
- [ ] Embed spike passed or fallback accepted by owner
- [ ] Biology chapters for the beta published and double-reviewed
- [ ] 20–50 invited students (adults or consented) and ≥ 5 reviewers
- [ ] Sentry live; RLS tests green; backups on
- [ ] Feedback form + weekly review ritual

**Public launch (phase B):**
- [ ] Privacy policy, terms, grievance contact lawyer-reviewed
- [ ] Parental consent flow verified
- [ ] Security checklist (doc 05 §10) complete
- [ ] Load test passed; Vercel Pro and Supabase paid tier active (needed before any monetisation)
- [ ] Brand name final (no "NCERT"/"NEET"), domain, email, logo, OG assets
- [ ] Disclaimer in footer and Settings → About
- [ ] Support inbox staffed; incident runbook and status page ready
- [ ] Launch-day monitoring plan and rollback rehearsed
