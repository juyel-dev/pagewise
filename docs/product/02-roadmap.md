# 02 · Roadmap

Tiers, not dates. Everything here is intentional; **nothing in "Next" or "Later" is built until its turn**. Ideas live here so they are never lost.

Legend: **P0** must ship in the tier · **P1** should · **P2** nice-to-have.

## Now: MVP (Biology 11 + 12, English, laptop-first)

| Area | Feature | Pri |
|---|---|---|
| Marketing | Landing page + waitlist | P0 (built) |
| Accounts | Google sign-in, onboarding (NEET year, target, preferred language) | P0 |
| Library | Class → chapter picker, resume where you left off | P0 |
| Workspace | Split view: NCERT page left, questions right; draggable divider; collapse either pane | P0 |
| Questions | **Focus mode** (one at a time) and **List mode** (all for the page); user choice remembered | P0 |
| Question types | MCQ, assertion–reason, statement-based, match-the-column | P0 |
| Feedback | Check answer, explanation, "see source page" jump | P0 |
| Keyboard | 1–4 / A–D select, Enter check/next, B bookmark, ←/→ page, `/` chapter search | P1 |
| Bookmark / report | Bookmark question; report wrong question | P0 |
| Themes | Light + dark | P0 |
| Reviewer console | Queue, approve / edit / reject, roles | P0 (internal) |
| Ops | Error tracking, product analytics, privacy-safe | P0 |

## Next

| Area | Feature | Pri |
|---|---|---|
| i18n | Hindi, then Bengali, then other NEET languages (Assamese, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu) | P0 |
| Mobile | Phone-first workspace (tabbed or stacked), installable PWA | P0 |
| Progress | Chapter accuracy, weak topics, time spent, streak | P0 |
| Mistake notebook | All wrong answers, re-attempt, tag reasons | P0 |
| Tests | Chapter tests, timed practice, result review | P1 |
| Revision | Spaced repetition on missed questions; flashcards | P1 |
| Notes | Personal notes and highlights per page | P1 |
| Notifications | Daily goal reminders (email / web push) | P2 |
| Reviewer community | Credits, badges, public contributor page, leaderboard, optional stipend | P1 |
| Accounts | Phone OTP, parent consent flow for under-18 users | P0 (before public launch) |
| Monetisation | Free core + optional premium (analytics depth, tests, offline PDF export) | P1 |

## Later

| Area | Feature |
|---|---|---|
| Content | Physics, Chemistry; previous-year question mapping where licensing allows |
| Assessment | Full-length mock tests, All-India rank, percentile |
| Learning | AI tutor chat grounded in the page; explain-like-I'm-new mode |
| Social | Doubt discussion per page, study groups, referral rewards |
| B2B | Coaching / teacher dashboards, cohort assignments, parent view |
| Platform | Native apps (TWA first), offline mode |
| Growth | Public SEO pages per topic (our own content only), shareable "question of the day" |

## Dependencies and risks

| Risk | Mitigation |
|---|---|
| Content accuracy | Generation → automated page-check → human review → report loop (doc 03) |
| NCERT embed doesn't work on some devices | Fallback: "Open official PDF at page N" button; desktop-first launch |
| Under-18 data (DPDP Act 2023) | Data minimisation, parental consent flow before public launch |
| Cost at scale | Pre-generated static question data on CDN; no per-user AI |
| Solo-founder bandwidth | Claude builds; owner reviews; student-reviewers scale content QA |
