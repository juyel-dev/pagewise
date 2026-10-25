# Blueprint · 08 · Build plan, risks and open questions

## 1. Spikes (do first, throw-away code, results recorded in decisions.md)

| ID | Question | Pass condition | Blocks |
|---|---|---|---|
| S-1 | Does NCERT's official chapter PDF embed with `#page=N` in an iframe on target browsers? Are chapter-PDF page numbers stable? | Works on desktop Chrome/Edge/Firefox/Safari; failure modes known for phones | Workspace design (Tier 1 vs Tier 2) |
| S-2 | Which NCERT edition is current for NEET Biology 11 and 12, and do chapter URLs/page counts match the syllabus we target? | Edition list + URL map confirmed against the official site | Content generation |
| S-3 | Can an LLM generate and an independent pass verify questions at the quality bar (doc 06)? Run 3 chapters, review 100 questions by hand | ≥ 85% approved with minor/no edits | Content cost and reviewer load |
| S-4 | Supabase RLS + Google auth + SSR cookies with the current Next.js version | Sign-in, RLS read/write proven on a preview | Auth architecture |

## 2. Milestones

| M | Name | Contents | Exit criteria |
|---|---|---|---|
| M0 | Approve plan | Owner answers open questions (§4), approves blueprint | Blueprint v1.0 tagged |
| M1 | Spikes | S-1…S-4 | Results logged; decisions D-1…D-4 updated |
| M2 | App shell | Design-system components, auth, onboarding, i18n scaffold, flags, CI, Sentry | Sign-in to empty Home on preview; CI green |
| M3 | Workspace on fixtures | Library, workspace (both panes, both modes, all 4 types), keyboard, a11y, themes | Playwright + axe green with sample chapter |
| M4 | Data and progress | Schema + RLS + migrations, attempts, bookmarks, reports, progress, queue/offline | RLS tests green; progress correct |
| M5 | Content pipeline + reviewer console | Generate, auto-check, review, publish, rollback | One chapter published end to end |
| M6 | Content build-out | Biology 11+12 generated and reviewed; coverage report | All beta chapters `covered` |
| M7 | Closed beta | Invite users and reviewers, feedback loop, fixes | Beta checklist (doc 07) done; metrics reviewed |
| M8 | Public-launch hardening | Consent flow, legal pages, security checklist, load test, status/support | Launch checklist done; owner go/no-go |
| M9+ | Phase C onward | Hindi/Bengali, mistake notebook, tests, PWA, then breadth | Per roadmap |

No calendar dates are promised; each milestone has exit criteria, and we move on only when met.

## 3. Risks

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| NCERT embed blocked or changes | Left pane unusable | Tier 2 fallback, kill switch, spike S-1, optional own-PDF tier | CTO |
| Wrong questions published | Loss of trust, marks | Review gates, double review sample, report auto-hide, rollback | Content lead |
| Copyright challenge | Takedown | Own content only, no NCERT hosting, legal review, optional NCERT outreach | Owner |
| Minors' data non-compliance | Legal, reputational | Consent flow before public launch, minimisation, no tracking | Owner + lawyer |
| Reviewer supply | Slow content | Contributor program, credits, double use of auto-check | Owner |
| Solo bandwidth | Delays | Small milestones, AI-assisted build, strict scope | Owner |
| Hosting terms (Vercel Hobby non-commercial) | Account issues | Move to Pro before launch/monetisation | Owner |
| Exam-season spike | Outage | Load test, CDN, degradation plan | CTO |
| Edition changes in NCERT | Stale questions | Edition field, edition-impact review, retire/re-map flow | Content lead |

## 4. Open questions the owner must decide (with recommendation)

| # | Question | Recommendation |
|---|---|---|
| D-1 | **Final product name** (placeholder "PageWise"; no "NCERT"/"NEET" in name) | Decide before M8; keep isolated in `brand.ts` |
| D-2 | Is the first audience adults/droppers only during closed beta, to postpone parental consent? | Yes: beta for 18+, consent flow before public launch |
| D-3 | Where do content releases live: `public/` in app repo, separate content repo, or Blob/bucket? | Separate content repo + CDN so content releases do not redeploy the app |
| D-4 | Accept that practice answers are in public static JSON (scrapable)? | Accept for MVP; gate ranked mocks later with server-side scoring |
| D-5 | Sign-in: Google only at first, or Google + email link? | Google + email link |
| D-6 | Questions per page target range (default 4–12) and difficulty mix | Confirm range after S-3 sample |
| D-7 | Reviewer incentives: credits only at first, or paid from day one? | Credits first, stipend after revenue |
| D-8 | Monetisation model and timing (free core + premium analytics/tests/offline) | Stay free through beta; decide at M8 |
| D-9 | Languages order after English: Hindi then Bengali as in roadmap? | Keep; Bengali early is a good fit for your audience too |
| D-10 | Is phone-first quality required at launch, or laptop-first with a good fallback? | Laptop-first, tabbed phone layout in phase B |
| D-11 | Landing page: keep current one live, build "launch edition" (01b) at M8? | Keep current; build 01b at M8 |
| D-12 | Decision #16 (landing stays mobile-first) | Confirm |
| D-13 | Analytics tool (Plausible vs PostHog) | Plausible-style cookieless for launch |
| D-14 | Will you personally act as admin, and who are the first 5 reviewers? | Owner is admin; recruit reviewers during M5–M6 |

## 5. Approval

When D-1…D-14 are answered, this blueprint becomes v1.0, `decisions.md` is updated with the choices, and M1 (spikes) starts. Until then: **no app code**.
