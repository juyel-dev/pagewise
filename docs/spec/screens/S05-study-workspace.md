# S05 · Study workspace

**Route:** `/study/[chapter]?p=<pdf page>` · **App:** web · **Status:** Draft (awaiting owner read) · **Related:** decisions 15, 18, 29, 38, 41; `blueprint/09`, `12`; canvas boards "Study workspace · desktop/mobile"

## 1. Purpose and success
- **User goal:** read one NCERT page and practise exactly that page's questions, then jump back to the source when wrong.
- **Product goal:** the core loop of the whole product. Everything else leads here.
- **Works when:** a student can open a chapter, answer 4 questions and see the source passage in under 60 s, on a mid-range phone. Events in §10.

## 2. Access
| Who | Can do |
|---|---|
| Guest | Everything in the loop; data in browser; soft sign-in prompt (GuestBanner); no limit on questions (decision 38) |
| Signed-in | Same + data in Postgres; cross-device |
| Staff | Student view of live chapters, plus draft chapters marked with a "Draft" chip. **Review/publish tools leave this screen in F3** (they live in `apps/admin`) |

## 3. Entry and exit
Entry: Study hub chapter card; Home "Continue reading" (opens at last page); Bookmarks "Open page" (`?p=`); direct URL. Invalid or missing `p` → last read page, else page 1; out-of-range values clamp to `[1, pageCount]`.
Exit: Back link → `/study`; browser back; app nav (hidden below `lg`, replaced by Back link).

## 4. Layout

Height: `calc(100dvh − 56px)` (app header). No page scroll; each pane scrolls itself.

```
≥1024 px ─────────────────────────────────────────────────────────────────────
┌ R1 Workspace header 48 ──────────────────────────────────────────────────────┐
│ ← Study   Biology · Class 11 · The Living World  [Draft]      ▓▓▓░░ 3/9 read │
├───────────────────────────────┬─┬────────────────────────────────────────────┤
│ R3 Practice pane (45 %)       │ │ R5 PDF pane (55 %)                         │
│ ┌ PageChipRail ─────────────┐ │R│ ┌ PdfToolbar 44 ─────────────────────────┐ │
│ │ p.3·5  p.4·4  p.6·3 …     │ │4│ │ ‹ PDF 4/9 · printed 77 ›  [go] − 100% + │ │
│ ├ mode + follow ────────────┤ │ │ │ Invert  Swap  Hide                     │ │
│ │ [Focus|List]  Follow ◉    │ │ │ ├─────────────────────────────────────────┤ │
│ ├ (GuestBanner) ────────────┤ │ │ │                                         │ │
│ │ QuestionCard              │ │ │ │            PDF pages                    │ │
│ │ …                         │ │ │ │                                         │ │
│ ├ sticky nav ───────────────┤ │ │ │                                         │ │
│ │ Prev  ● ● ✓ ×  Next      │ │ │ │                                         │ │
│ └ hint row ─────────────────┘ │ │ └─────────────────────────────────────────┘ │
└───────────────────────────────┴─┴────────────────────────────────────────────┘
768–1023 and <768: R1 compact (back + title), Tabs [Read | Practise] full width 44 px,
one pane at a time; Practise has a sticky bottom action bar (64 px).
```

Dimensions: R1 48 px (`surface`, bottom border `line`); separator R4 12 px; split default 45/55; min widths left 320 / right 360 (swapped: 360/320); PDF toolbar 44 px; practice pane inner padding 16 (20 from `xl`); question card max width 720 px, centred when pane is wider.

## 5. Elements

### R1 · Workspace header
| ID | Component | Content / behaviour |
|---|---|---|
| H1 | BackLink | "← Study" → `/study` (keeps hub filter) |
| H2 | Text | `{Subject} · Class {class} · {chapter title}`, truncates with ellipsis, full title in `title` attribute |
| H3 | Chip (accent) | "Draft", staff only, when chapter status = draft |
| H4 | ProgressBar + text | `pages_seen.length / pageCount` and "n of N pages read"; hidden below `md`; `aria-label="Reading progress"` |

### R2/R5 · PdfToolbar (PDF pane, top)
| ID | Component | Content / behaviour |
|---|---|---|
| T1 | IconButton | "Previous page" `‹`; disabled on page 1 |
| T2 | Text | `PDF {n}/{N} · printed {label}`; label "—" if none; `aria-live=polite` |
| T3 | IconButton | "Next page" `›`; disabled on last page |
| T4 | Input | "Go to page" numeric, 96 px; Enter jumps by **printed** label, falls back to PDF page number; invalid → inline "No page {x}" for 3 s, no jump |
| T5 | IconButton ×2 + text | Zoom `−` / `{pct}%` / `+`; range 50–300 %, step 10; "Reset" on double-click of % |
| T6 | Switch | "Invert pages" (off by default; stored in prefs) |
| T7 | Button ghost | "Swap sides"; flips panes and ratio |
| T8 | Button ghost | "Hide PDF (V)" / "Show PDF (V)"; hidden: practice pane fills width |
| T9 | Menu | Below `lg`, T6–T8 collapse into "More" |
Staff-only upload button is removed from the student app (admin app in F3).

### R3 · Practice pane
| ID | Component | Content / behaviour |
|---|---|---|
| P1 | PageChipRail | One chip per PDF page that has ≥ 1 published question. Label `p.{printed}` · `{count}`. Selected = page being practised. Complete page gets a ✓ dot. Click: practise that page and scroll PDF to it |
| P2 | SegmentedControl | "Focus" \| "List"; default Focus; persisted in prefs |
| P3 | Switch | "Follow my reading"; **default ON** (see §6 flow 6) |
| P4 | GuestBanner | Guest only; dismissible per session |
| P5 | Text (caption) | `Reading: PDF page {n} · printed page {label}`, `aria-live=polite` |
| P6 | QuestionCard | See `02-components.md` §C; one card (Focus) or all of the page's cards (List) |
| P7 | QuestionDots | Focus mode only, between Prev/Next |
| P8 | Buttons | "Previous" (secondary), "Next" (secondary; primary after the question is checked), sticky at pane bottom |
| P9 | PageSummary | Replaces the card area after the last question of the page is checked and the student presses Next/Enter |
| P10 | KeyHint row | Desktop only: `1–4 choose · Enter check · N next · B save · S source · ? all shortcuts` |
| P11 | FollowChip | Inline chip when Follow is ON but switching was deferred: "Page {x} has {k} questions — Switch" |

### R4 · Separator
`role=separator`, 12 px, grip 4 × 40 px; hover `brand-soft`; keyboard ←/→ 2 % steps (Shift = 10 %), Home/End = min/max, double-click = reset 45/55 (55/45 when swapped); drag with pointer capture; ratio persisted in prefs; visible only at `lg+` and when PDF shown.

### R5 · PDF viewer
PdfViewer fills remaining height; background `surface-2`; page canvas white (or inverted); 16 px gaps; first paint shows skeleton page at the correct aspect ratio; current page = the page covering most of the viewport centre line.

### Mobile-only
| ID | Component | Content / behaviour |
|---|---|---|
| M1 | Tabs | "Read" \| "Practise", default **Practise** when arrived without `?p`, **Read** when arrived with `?p` from Bookmarks |
| M2 | Bottom action bar | `Previous` IconButton · primary button that is `Check` → `Next` → `Next page` · `Show in NCERT` secondary icon button; respects safe-area inset |

## 6. Interactions and flows

1. **Open.** Server sends chapter + page map + signed PDF URL + all published questions grouped by page. Client reads progress (local or server). Open at resolved page (see §3). Practice pane shows that page's questions if any, else the nearest page with questions as a P11 hint.
2. **Answer (single choice).** Press option or key `1–4`/`A–D` → option `selected`; Check enabled. Press Check/Enter → options lock; correct option `correct`, a wrong pick `incorrect`; result block appears; attempt recorded (flow 3).
3. **Record attempt.** `recordAttempt({questionId, versionId, chosen, timeMs})` immediately after Check. UI updates optimistically from local grading (`isCorrect`), but the **stored** correctness is whatever the database decides. Failure → keep UI, queue and retry silently; Toast only if the queue still fails after 3 tries ("Your answer couldn't be saved yet. We'll keep trying.").
4. **Multi-select / match-the-column / assertion-reason.** Same flow; multi-select needs ≥ 1 choice; correct only if the chosen set equals the correct set.
5. **Retry.** "Try again" clears selection, sets `attemptNo + 1`, hides result; only attempt #1 counts toward accuracy (note shown after retry).
6. **Follow my reading (ON).** When the PDF's current page changes to a page with questions: if the current page's questions are all checked, or none started → switch automatically (animate 150 ms, announce "Showing questions for printed page {x}"). Otherwise show P11 and do not interrupt. When OFF, nothing switches; P1 chips are the only way.
7. **Page chip.** Switch practised page, reset focus index to first unanswered (else 0), scroll PDF to that page.
8. **Show in NCERT.** Scroll PDF to the question's page; then find `source_text` in the page's text layer (normalise: lower-case, collapse whitespace, remove soft hyphens, fold ligatures); highlight the longest match ≥ 20 characters with `accent-soft` background + 2 px `accent` outline for 6 s or until the next interaction. Not found → outline the whole page for 1.5 s and Toast "We couldn't pinpoint the passage, so we're showing the page." On mobile switch to the Read tab first.
9. **Page complete.** After Next on the last question: P9 PageSummary — "Page complete", `{k} of {n} correct`, ProgressBar; actions: "Retry the ones you missed" (only if any wrong), "Next page with questions" (primary, if exists), "Keep reading". Escape/“Keep reading” returns to the list view of that page.
10. **Bookmark.** Star toggles; optimistic; announces "Saved" / "Removed from saved".
11. **Reading progress.** Mark a PDF page as seen after it is ≥ 50 % visible for 2 s. `saveProgress` debounced 5 s and on `visibilitychange=hidden`. Resume position = last page with 2 s visibility.
12. **Resize / swap / hide / invert / zoom.** As R4 and toolbar; all stored in prefs (guest: local).
13. **Sign-in during session.** Banner link goes to `/sign-in?next=<current URL>`; after return, `syncLocalData` merges; UI updates without reload.

### Keyboard (ignored while typing in an input/textarea or with Ctrl/Meta/Alt)
| Key | Action |
|---|---|
| `1`–`8` / `A`–`H` | Choose option |
| `Enter` | Check if a choice exists; else Next if checked |
| `N` / `Shift+N` | Next / previous question |
| `B` | Toggle bookmark |
| `S` | Show in NCERT (after check) |
| `R` | Try again (after check) |
| `Q` | Jump to questions of the current PDF page |
| `V` | Show/hide PDF |
| `[` / `]` | Previous / next PDF page |
| `/` | Focus "Go to page" |
| `?` | Open shortcuts Dialog |
Arrow keys move between options inside a radio group (existing behaviour).

## 7. State matrix
| State | When | What the student sees |
|---|---|---|
| Loading | Before data/PDF | R1 real; practice pane Skeleton (chip row, card); PDF skeleton page |
| Chapter has no published questions | 0 questions | EmptyState in practice pane: "Questions for this chapter are still being reviewed. Every question is checked before it is published, so none are shown yet. You can read the chapter now." |
| Page has no questions | Current page empty | EmptyState "No questions on this page" + button "Go to page {x}" (next page with questions) |
| PDF unavailable | No PDF path | Viewer pane: "Chapter PDF not available yet. The NCERT page for this chapter is not published yet."; practice pane still works |
| PDF page error | Render failure | Banner "A PDF page could not be displayed." + "Reload PDF" |
| Offline | `navigator.onLine=false` | Small offline pill in R1 "Offline — answers are saved on this device"; attempts queue |
| Save failing | Queue retries failed | Toast per flow 3 |
| Guest | No session | P4 shown |
| Chapter not found / not live | Bad slug, or draft for non-staff | 404 page |

## 8. Data
Reads: `loadStudy(slug, {p, review:false})`; local store (guest) or server (signed-in) for progress, bookmarks, attempts. Writes: `recordAttempt`, `saveProgress`, `toggleBookmark`; prefs (split ratio, mode, follow, invert, swapped, zoom) via `profiles.prefs` or local. See `04-data-contracts.md`. Question order: by `pdf_page`, then `external_id`.

## 9. Accessibility
Landmarks: header (`banner` from shell), `main` = workspace, practice pane `section[aria-label="Practice"]`, PDF pane `section[aria-label="NCERT chapter PDF"]`. Separator has value text. Option group = `radiogroup`/`group` with `aria-label="Options"`. Result block `role=status`. Page/question changes announced politely. Tabs: arrow keys, `aria-selected`. All icon buttons labelled. Focus after Check moves to the result block's first action; after page chip click stays on the chip. Respect reduced motion (no scroll animation, no fade).

## 10. Analytics (cookieless, IDs only)
`study_opened {chapter_id, source: hub|home|bookmark|link}` · `page_seen {chapter_id, pdf_page}` (once per page per session) · `question_answered {question_id, attempt_no, correct, time_ms, mode}` · `question_retried {question_id}` · `source_opened {question_id, found}` · `bookmark_toggled {question_id, on}` · `mode_changed {mode}` · `page_summary_action {action}` · `pdf_error {kind}` · `guest_banner_click` · `shortcut_used {key}` (sampled 10 %).

## 11. Performance
First usable (page visible + first question interactive) < 3 s on mid-range Android, 4G. Page turn < 200 ms. Check → result < 100 ms. PDF: read page sizes lazily; render window current ± 2; cancel off-screen renders; cache rendered pages ≤ 8. Practice pane JS must not block PDF first paint. Server renders with ≤ 3 sequential DB round trips (region `bom1`).

## 12. Copy deck
Back: "← Study" · Progress: "{n} of {N} pages read" · Toolbar: "Previous page", "Next page", "Go to page", "Zoom out", "Zoom in", "Invert pages", "Swap sides", "Hide PDF", "Show PDF", "More" · Practice: "Focus", "List", "Follow my reading", "Reading: PDF page {n} · printed page {label}" · Question: "Select all that apply.", "Check", "Try again", "Show in NCERT", "Save"/"Saved", "Previous", "Next question", "Next page with questions" · Result: "Correct.", "Not quite.", "Correct answer", "Your answer", "From the page: “{text}”", "Only your first attempt counts toward your accuracy." · Summary: "Page complete", "{k} of {n} correct", "Retry the ones you missed", "Keep reading" · Guest: "Guest mode — everything is free. Progress and bookmarks stay in this browser. Sign in to keep them on all your devices." + "Sign in" · Follow chip: "Page {x} has {k} questions — Switch" · Errors/empties: as §7 and Toasts in flows 3, 8.

## 13. Edge cases
1. `p` = 0, negative, non-numeric, > N → clamp / ignore. 2. Printed label missing → "—". 3. `unit_intro` pages have no questions; they still count for reading progress. 4. Option text very long or multi-line (preserve line breaks, wrap). 5. Match-the-column on narrow panes: stack columns. 6. Rapid double Check → one attempt. 7. Switching page while an unchecked selection exists → selection kept per question in memory. 8. Tab hidden while timing → timer pauses. 9. Two tabs, same user: attempts append, progress last-write-wins. 10. Question version changes while open → next load uses new version; attempts keep their original version. 11. User zoomed to 300 % on phone → horizontal scroll inside PDF pane only. 12. PDF fails but questions load → practice still works. 13. Guest clears browser data → progress lost; banner states it. 14. Student rotates device → layout re-evaluates at breakpoint, state preserved.

## 14. Acceptance tests
1. Given a live chapter, when I open `/study/class11-bio-ch01`, then the PDF shows page 1 (or my last page) and the practice pane shows that page's questions or an empty state with a jump button.
2. Given `?p=5`, when the page opens, then PDF page 5 is visible and P5 says page 5.
3. Given `?p=999`, then PDF page N is shown; given `?p=abc`, then last read page.
4. Given a single-choice question, when I press `2`, then option 2 is selected and Check is enabled.
5. When I press Enter, then options lock, correct/incorrect are shown with ✓/✗ and text, and the explanation and "From the page" appear.
6. Given I answered correctly, then the DB row has `is_correct=true` even if the client had sent `false` (SQL test exists).
7. When I press "Try again", then selection clears and the next Check stores `attempt_no = 2`; accuracy counts only attempt 1.
8. Given a multi-select question, when I select a subset of correct answers and Check, then it is marked incorrect.
9. Given Follow is ON and all questions on this page are checked, when I scroll the PDF to a page with questions, then the practice pane switches and announces it.
10. Given Follow is ON and I have an unchecked selection, when the PDF page changes, then the pane does not switch and P11 appears.
11. Given Follow is OFF, when I scroll, then nothing switches.
12. When I click page chip p.6, then the PDF scrolls to that page and questions for p.6 show.
13. When I press "Show in NCERT" and the passage exists, then it is highlighted for 6 s; if it does not, then the whole page is outlined and the toast appears.
14. When I check the last question of a page and press Next, then PageSummary appears with the right count and actions.
15. When I press `B`, then the question is saved and "Saved" is announced; reload keeps it.
16. When I resize the separator and reload, then the ratio is restored; double-click resets it.
17. When I press `V`, then the PDF hides and the practice pane fills the width; press again to restore.
18. Given width 390 px, then Tabs show Read/Practise, only one pane is visible, and the bottom action bar sits above the safe area.
19. Given width 390 px and I tap "Show in NCERT", then the Read tab opens with the highlight.
20. Given no published questions, then the "still being reviewed" empty state shows and the PDF works.
21. Given no PDF, then the unavailable message shows and questions work.
22. Given I am a guest, then P4 shows; after sign-in the same attempts appear without reload and none are duplicated.
23. Given offline, when I check an answer, then the UI responds, the offline pill shows, and the attempt is saved after reconnect.
24. Keyboard only: every action in §6 is reachable and focus is visible; axe reports 0 serious violations.
25. Contrast script passes in light and dark.
26. First usable < 3 s and page turn < 200 ms on the reference profile (Playwright timing).
27. A draft chapter returns 404 for non-staff and shows the Draft chip to staff.
28. Reduced-motion: no animated scroll or fade.

## 15. Implementation plan
Each step is its own PR; tests listed in §14 are added with the step that satisfies them.
1. **Pure logic + tests** (`features/study/`): `resolveInitialPage`, `nextPageWithQuestions`, `normaliseForMatch`, `findPassage`, `pageSummary`. (A3, 14 helpers)
2. **`StudyStore`** interface with `LocalStore` and `RemoteStore`; remove `guest` branches from the workspace. (22, 23)
3. **Hooks**: `useReadingProgress`, `usePracticeSession` (reducer for answers, retry, focus, summary), `useSplitPane`, `useWorkspaceShortcuts`, `useWorkspacePrefs`. Workspace file < 200 lines.
4. **UI primitives** from `02-components.md`: SegmentedControl, Chip, Switch, IconButton, Skeleton, EmptyState, Toast, Dialog, Tabs.
5. **Components**: SplitPane, PdfToolbar, PageChipRail, restyled QuestionCard, QuestionDots, PageSummary, SourceQuote, KeyHint.
6. **PdfViewer**: lazy page sizes, mixed sizes, render window, `highlight()` API. (1, 13, 26)
7. **Assembly + states + mobile layout** (flows, §7, M1–M2). (18–21)
8. **Analytics + a11y + performance pass**; Playwright flows for tests 1, 5, 9, 13, 18, 22, 26.
9. **Staff tools removal** in F3 (admin app).

## 16. Open questions
None blocking. To confirm when the owner reads this: (a) Follow my reading default ON (this spec), (b) key `Q` and `?` additions, (c) PageSummary after the last question.

## 17. Change log
| Date | Change |
|---|---|
| 2026-11-07 | First full draft from the as-built workspace, canvas boards and decisions |
