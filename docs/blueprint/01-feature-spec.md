# Blueprint · 01 · Feature specification

Priority: **P0** must ship in phase · **P1** should · **P2** nice. Phases: A = closed beta, B = public launch, C = depth, D = breadth, E = scale.

## 1. Catalogue

### Accounts and onboarding (ACC)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| ACC-1 | Google sign-in (Supabase Auth) | P0 | A |
| ACC-2 | Email magic link as non-Google fallback | P1 | A |
| ACC-3 | Onboarding: display name, NEET target year, preferred language, class (11/12/dropper) | P0 | A |
| ACC-4 | Date-of-birth or "I am under 18" gate; sets `is_minor` | P0 | B |
| ACC-5 | Parental consent flow for minors | P0 | B |
| ACC-6 | Phone OTP | P1 | C |
| ACC-7 | Account deletion and data export (self-serve) | P0 | B |
| ACC-8 | Sign out everywhere | P2 | C |

### Library (LIB)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| LIB-1 | Class → chapter picker with chapter title, page count, question count | P0 | A |
| LIB-2 | Per-chapter progress ring (pages visited, accuracy) | P0 | A |
| LIB-3 | Resume where you left off (home + library) | P0 | A |
| LIB-4 | Chapter search (`/` shortcut) | P1 | A |
| LIB-5 | Topic/section index inside a chapter | P1 | C |

### Study workspace (WS)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| WS-1 | Two-pane layout (NCERT left, practice right), ≥1024 px | P0 | A |
| WS-2 | Draggable, keyboard-resizable divider; collapse either pane; position remembered | P0 | A |
| WS-3 | App-owned page navigator (prev/next/jump-to) is the source of truth for "current page" | P0 | A |
| WS-4 | NCERT pane: embed official PDF at `#page=N`; fallback button "Open NCERT page N" | P0 | A |
| WS-5 | Sync-warning: if viewer may be out of step, show one-click "Re-sync to page N" | P0 | A |
| WS-6 | Stacked/tabbed layout below 1024 px (Read tab, Practise tab) | P0 | B |
| WS-7 | Page with no questions: friendly empty state + "next page with questions" | P0 | A |
| WS-8 | Chapter outline drawer (pages with question counts and status dots) | P1 | A |
| WS-9 | Distraction-free mode (hide chrome) | P2 | C |
| WS-10 | User-uploaded PDF kept only in browser (never uploaded) | P2 | D |

### Practice (PRA)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| PRA-1 | Focus mode (one question at a time) | P0 | A |
| PRA-2 | List mode (all questions for the page) | P0 | A |
| PRA-3 | Mode choice remembered per user | P0 | A |
| PRA-4 | Question types: MCQ, assertion-reason, statement-based, match-the-column | P0 | A |
| PRA-5 | Select, Check, then explanation; answer locked after check; "Try again" resets (not counted twice) | P0 | A |
| PRA-6 | Explanation with "See source page" (jumps NCERT pane) | P0 | A |
| PRA-7 | Per-question timer (hidden by default, optional) | P2 | C |
| PRA-8 | Skip question; skipped shown at end of page | P1 | A |
| PRA-9 | Difficulty tag visible; filter by difficulty | P2 | C |
| PRA-10 | Keyboard: 1–4/A–D select, Enter check/next, B bookmark, ←/→ page, `/` search, `?` help | P1 | A |
| PRA-11 | Match-the-column rendered as accessible two-list selector | P0 | A |
| PRA-12 | Math/chemistry notation (superscript, subscript, symbols) via safe markup, no raw HTML | P0 | A |

### Saved items (SAV)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| SAV-1 | Bookmark question | P0 | A |
| SAV-2 | Bookmarks screen, filter by chapter | P0 | A |
| SAV-3 | Report question (reason + optional note) | P0 | A |
| SAV-4 | Mistake notebook: every wrong answer, re-attempt, reason tag | P0 | C |
| SAV-5 | Personal notes per page | P1 | C |
| SAV-6 | Highlights on explanation text | P2 | D |

### Progress (PRG)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| PRG-1 | Attempts recorded (question, chosen, correct, time) | P0 | A |
| PRG-2 | Chapter accuracy and pages covered | P0 | A |
| PRG-3 | Daily goal (questions/day, user-set) and calm streak | P1 | A |
| PRG-4 | Weak topics list | P1 | C |
| PRG-5 | Spaced repetition queue from missed questions | P1 | C |
| PRG-6 | Weekly summary (in-app, email optional) | P2 | D |

### Tests (TST)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| TST-1 | Chapter test (N random published questions, timed optional) | P1 | C |
| TST-2 | Result review with source-page links | P1 | C |
| TST-3 | Full-length mock and All-India rank | P1 | D |

### Reviewer and admin (REV)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| REV-1 | Role-gated review queue (auto-check failures first, then sample) | P0 | A |
| REV-2 | Review screen: page reference, question, edit inline, approve/reject with reason | P0 | A |
| REV-3 | Immutable version history and diff | P0 | A |
| REV-4 | Reported-question queue; auto-hide above threshold | P0 | A |
| REV-5 | Reviewer stats (reviewed, agreement, turnaround) | P1 | B |
| REV-6 | Credits, badges, public contributor page | P1 | C |
| REV-7 | Admin: roles, chapters, publish export trigger, content stats | P0 | A |
| REV-8 | Audit log of every review/publish/role change | P0 | A |

### Platform (PLT)

| ID | Feature | Pri | Ph |
|---|---|---|---|
| PLT-1 | Light/dark/system theme | P0 | A |
| PLT-2 | i18n scaffolding (`next-intl`), English catalogue | P0 | A |
| PLT-3 | Hindi, Bengali catalogues and content | P0 | C |
| PLT-4 | Error tracking (Sentry) and consented, privacy-safe analytics | P0 | B |
| PLT-5 | Status/feedback link and support email | P0 | B |
| PLT-6 | PWA installable, offline last chapter | P1 | C |
| PLT-7 | Feature flags (env-based) incl. waitlist ↔ sign-in switch | P0 | A |
| PLT-8 | Privacy policy, terms, grievance contact, cookie notice (if any non-essential) | P0 | B |

## 2. Acceptance criteria for P0 features

**ACC-1 Google sign-in**
- Given a visitor, when they choose Google, then they land in onboarding (new) or Home (returning) within 3 s on a normal connection.
- Cancelling the Google popup returns to sign-in with no error banner.
- Session persists across reloads; expired session redirects to sign-in and returns to the original URL.

**ACC-3 Onboarding**
- Cannot reach the app until display name, target year and language are set.
- Target year offers current and next two NEET years. Language offers only languages with published content (English in phase A).
- Fields editable later in Settings.

**ACC-4/5 Minors and consent (before public launch)**
- A user under 18 cannot answer questions or save data until consent is verified.
- Consent flow: parent email receives link; parent confirms; status stored with timestamp; student notified.
- Unverified minors can only see the landing page and the consent-pending screen.
- Consent can be withdrawn; withdrawal triggers deletion within the retention policy period (doc 05).

**LIB-1/2/3 Library**
- Lists all chapters of the chosen class in book order with real counts from the content manifest.
- Progress ring shows pages visited / total pages and accuracy; zero state shows "Not started".
- "Resume" opens the exact last page of the last chapter; if that page was retired, opens the nearest page.

**WS-1/2 Layout and divider**
- At ≥1024 px two panes show side by side; default split 55/45 (NCERT/practice).
- Divider drag, arrow keys (±16 px, Shift ±64 px), Home/End to min/max, double-click to reset.
- Min pane width 320 px; collapsing a pane keeps a 40 px rail with a restore button.
- Split position and collapsed state persist per user (localStorage, synced to profile after sign-in).

**WS-3/4/5 Page model (critical)**
- The page navigator owns `currentPage`. Changing it updates URL (`?p=N`), NCERT pane (`#page=N`) and the question set together.
- The embed is display-only; the app does not and cannot read the scroll position of a cross-origin PDF.
- If the user scrolls inside the viewer, the app shows an unobtrusive hint "Reading ahead? Use the page controls to load matching questions".
- If embed fails (blocked, timeout 8 s, mobile browser), show the fallback card: "Open NCERT page N" (new tab) with chapter and page, and a note that practice still works.
- No NCERT file is ever fetched, proxied or cached by our servers.

**PRA-1/2/3 Modes**
- Focus: shows question n of m, progress dots, Previous/Next, skip.
- List: all questions for the page rendered as cards; checking one does not move scroll.
- Switching mode keeps the current question in view and all answered state intact.

**PRA-4/11 Types**
- Each type has a distinct, accessible renderer and a schema-validated payload.
- Match-the-column is operable by keyboard and screen reader (listbox pairs, not drag-only).

**PRA-5/6 Check and explain**
- Check is disabled until an option is chosen.
- After check: correct/wrong shown with icon + text + colour; the correct option is revealed; explanation and source-page link appear.
- Re-attempt after reveal is allowed for learning but only the first attempt counts toward accuracy.
- Result is saved even if the network drops (queued and retried; user sees "Saved" or "Will sync").

**SAV-1/2/3 Bookmark and report**
- Bookmark toggles instantly (optimistic) with rollback on failure.
- Report requires a reason from a fixed list (wrong answer, ambiguous, outside page, typo, other); max one open report per user per question.
- Reported questions reaching the threshold (default 3 distinct users) are hidden from students and queued (REV-4).

**PRG-1/2 Progress**
- Every first attempt writes one `attempts` row; no duplicates on retry.
- Chapter accuracy = correct first attempts / total first attempts, shown with sample size when under 10.

**REV-1..4,7,8 Reviewer**
- Only `reviewer` and `admin` roles reach `/review`; direct URL for others returns 404.
- Approve requires: source page confirmed, one defensible answer, explanation present.
- Edits create a new version; old versions are never mutated.
- Every action writes an audit row (who, what, when, before/after ids).

**PLT-1 Theme**: system default, user override, no flash of wrong theme on load.
**PLT-2 i18n**: no hard-coded user-facing strings outside catalogues in app code.
**PLT-7 Flags**: `NEXT_PUBLIC_APP_OPEN=true` flips landing CTA from waitlist to sign-in with no code change.
