# 04 · Home `/home`

**Picture.** The student's daily starting point. One big card says exactly where to continue. Beside it, today's goal. Underneath, small honest tiles (streak, review, accuracy), then their chapters and the topics that need work. Everything is real data from this person (or this device, for guests). A brand-new user sees warm, simple empty states, never fake numbers.

## Wireframe — desktop (content area ≥ 1024, 12-column grid, gap 16, page padding 32)
```
┌ top bar: Home                         [Search ⌘K]  🌐  ◐  (J) ───────────────┐
│ Good evening, Juyel                                                          │
│ You've answered 12 of 20 today.                                              │
│ ┌ GuestBanner (guests only) ─────────────────────────────────────────────┐   │
│ ┌ CONTINUE (col 1-8) ─────────────────────────┐ ┌ TODAY (col 9-12) ───────┐ │
│ │ [01 cover]  Continue reading                │ │        ◜ 60% ◝          │ │
│ │             Anatomy of Flowering Plants     │ │        12 / 20          │ │
│ │             Biology · Class 11 · Ch 6       │ │  questions today        │ │
│ │ Page 4 of 18 ▓▓▓░░░░░░░ 22 %                │ │  8 left to reach goal   │ │
│ │ [Resume page 4]  [Practise this page]       │ └─────────────────────────┘ │
│ └─────────────────────────────────────────────┘                              │
│ ┌ STREAK (4) ──┐ ┌ REVIEW (4) ──────┐ ┌ ACCURACY, 7 DAYS (4) ┐              │
│ │ 6 days       │ │ 7 due            │ │ 68 %                  │              │
│ │ Best: 9      │ │ [Start review]   │ │ from 140 answers      │              │
│ └──────────────┘ └──────────────────┘ └───────────────────────┘              │
│ ┌ YOUR CHAPTERS (col 1-8) ────────────────────┐ ┌ NEEDS WORK (col 9-12) ───┐ │
│ │ In progress                                 │ │ Plant tissues      35 %   │ │
│ │  ▸ Anatomy of Flowering Plants  22 %  Open  │ │  [Practise]               │ │
│ │ Not started                                 │ │ Taxonomic hierarchy 52 %  │ │
│ │  ▸ The Living World             0 %   Start │ │  [Practise]               │ │
│ │ [Browse all chapters →]                     │ └───────────────────────────┘ │
│ └─────────────────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────────────────┘
```
(Numbers above are layout illustrations only.)
**Phone 390:** one column in this order: greeting, GuestBanner, Continue, Today, Streak + Review (2-up), Accuracy, Your chapters, Needs work; bottom tab bar visible; page padding 16.

## Top to bottom
### S1 · Greeting block (`mb:24`)
| E | Component | Copy / style |
|---|---|---|
| 1 | `h1` | "Good morning/afternoon/evening, {first name}" by local time; guest: "Welcome back" (returning) / "Welcome" (first time) · `type:H1` `ink` |
| 2 | Text | Contextual line, `type:Body` `ink-2`: goal not met → "You've answered {n} of {goal} today."; goal met → "Daily goal done. Nice work."; nothing today → "Ready when you are."; brand-new user → "Let's start your first chapter." |
| 3 | Profile nudge (conditional) | If onboarding was skipped: `accent-soft` bar "Finish setting up your profile" + "Continue" link → `/onboarding`; dismissible |

### S2 · GuestBanner (guests only, below greeting)
`bg:brand-soft b:brand/20 r:12 p:12/16`: "You're studying as a guest. Your progress stays on this device." + `primary` sm "Sign in to keep it" → `/sign-in?next=/home`; close "×" hides for the session.

### S3 · Continue card (col 1–8)
`Card raised p:24`, horizontal on ≥ md. Left cover tile 96 × 96, `r:16`, tinted by subject, big chapter number `type:H1` in `brand-text` (e.g. "06"). Right column:
| E | Component | Copy / style | → |
|---|---|---|---|
| 1 | Eyebrow | "Continue reading" `type:Caption` `muted` uppercase 0.04em | — |
| 2 | Title `h2` | chapter title `type:H2`, max 2 lines | — |
| 3 | Meta | "Biology · Class 11 · Chapter 6" `type:Small` `ink-2` | — |
| 4 | Position | "Page 4 of 18 · printed 77" `type:Small` | — |
| 5 | ProgressBar | pages read / total, 6 px, `good` fill; label "22 % read" `Caption` | — |
| 6 | Button | "Resume page 4" `primary` md | `/study/{slug}?p=4` |
| 7 | Button | "Practise this page" `secondary` md (only if page has questions) | `/study/{slug}?p=4` with Practise tab on phone |
No history yet: the card becomes an invitation — cover tile shows book icon, title "Start your first chapter", text "Open a chapter and begin reading. Your place is saved automatically.", `primary` "Choose a chapter" → `/study`.

### S4 · Today (col 9–12)
`Card p:24`. ProgressRing 96 px (brand over `surface-2`) with `n / goal` in the centre (`type:H2` tabular). Under it `type:Small`: "questions today". Line: "{goal − n} left to reach your goal" or, when done, a `good` "Goal reached ✓". Link-button "Change goal" → `/settings#preferences` (signed-in) or a small popover for guests (10/20/40/60).

### S5 · Stat tiles (3 × col 4)
Each `StatTile`: label `Small` `muted`, value `type:H1` tabular, sub-line `Small`.
| Tile | Value | Sub-line | Empty state | → |
|---|---|---|---|---|
| Streak | "{n} days" | "Best: {m}" | "0 days" · "Answer a question to start one" | `/progress` |
| Review | "{n} due" | button `secondary` sm "Start review" | "Nothing due" · "Questions you miss come back here" | `/practice/review` (guest: sign-in sheet) |
| Accuracy (7 days) | "{p} %" | "from {k} answers" | "—" · "Answer a few questions to see this" (needs ≥ 10 answers) | `/progress` |
Streak = consecutive local days with ≥ 1 answered question; one missed day resets it; no guilt copy.

### S6 · Your chapters (col 1–8)
`Card p:0`, header row `p:20` with `h2` "Your chapters" `type:H2` and link "Browse all →" `/study`. Rows (min-height 64, `b-top:line`, `p:16/20`): 40 px tint tile with number · title (`type:H3`) + meta `Small` · ProgressBar 120 px + "22 %" · `secondary` sm "Open"/"Start". Grouped under small group labels "In progress" then "Not started"; max 5 rows then "Show all". Row click anywhere → `/study/{slug}`. Empty (no live chapters): EmptyState "Chapters are being prepared." with no button.

### S7 · Needs work (col 9–12)
`Card p:20`, `h2` "Needs work" and `Small` "Topics where you miss the most". Up to 3 rows: topic name (`Label`), accuracy bar in `bad`/`accent` by band (< 50 % `bad`, 50–70 % `accent`), "{p} %" , `secondary` sm "Practise" → `/practice?topic={id}`. Appears only after ≥ 5 graded answers in a topic; before that the card shows EmptyState: "Answer a few questions and we'll show what to revise."

## States
Loading: skeletons matching each card (ring circle, 3 tile blocks, 3 list rows). Error per card: small inline "We couldn't load this. Try again." + `ghost` button (cards fail independently). Offline: cards from local data; offline pill shown. Guest: all data from the device. Signed-in first visit: only S3 invitation, S4 at 0/goal, S5 empty states.

## Colour, type, i18n
Page `bg:canvas`; cards `surface` with `line` border; only the Continue card uses `sh:card`. Subject tints for cover tiles: Biology `good-soft`/`good`, Physics `brand-soft`/`brand-text`, Chemistry `accent-soft`/`accent-text`. i18n prefix `home.*`; greeting uses locale time of day.

## Where every click goes
Resume → workspace at page · Practise this page → workspace (Practise) · Choose a chapter / Browse all → `/study` · Chapter row → workspace · Start review → `/practice/review` · Streak/Accuracy tile → `/progress` · Practise (topic) → `/practice?topic=` · Change goal → Settings · Sign in to keep it → `/sign-in`.
