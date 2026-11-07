# 07 · Practice: hub, session setup, session, result, review queue

**Picture.** Studying beside the book happens in the workspace. This area is for practising **away from the page**: quick sets with instant feedback, a timed chapter test, and a review queue that brings missed questions back at the right time. All three share one *session* screen so the app feels the same everywhere.

**Routes (overrides the earlier plan, decision 50):** `/practice` hub · `/practice/new?type=` setup · `/practice/session/[id]` run · `/practice/session/[id]/result` result · `/practice/review` review queue.
**Session types:** `quick` (untimed, instant feedback) · `test` (timed, answers shown after submit) · `review` (spaced repetition, one at a time).

## 1 · Practice hub `/practice`
```
┌ top bar: Practice ──────────────────────────────────────────────────────────┐
│ Practice                                                                     │
│ Choose how you want to practise.                                             │
│ ┌ Resume (only if a session is open) ─────────────────────────────────────┐ │
│ │ Quick practice · The Living World · 7 of 20      [Resume]  [Discard]     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌ Quick practice ─────────┐ ┌ Chapter test ───────────┐                     │
│ │ ⚡ Instant feedback      │ │ ⏱ Timed, results at end │                     │
│ │ Pick a chapter or topic. │ │ Test yourself like NEET.│                     │
│ │ [Start]                  │ │ [Set up test]           │                     │
│ └──────────────────────────┘ └─────────────────────────┘                     │
│ ┌ Review queue ───────────┐ ┌ Weak topics ────────────┐                     │
│ │ 🔁 7 due                 │ │ 🎯 Plant tissues, …      │                     │
│ │ Missed questions return. │ │ Practise what you miss. │                     │
│ │ [Start review]           │ │ [Practise]              │                     │
│ └──────────────────────────┘ └─────────────────────────┘                     │
│ Practise by chapter                                                          │
│  The Living World   171 questions   68 % accuracy      [Practise]            │
└──────────────────────────────────────────────────────────────────────────────┘
```
Mode cards: `Card interactive p:24 r:16`, 2 × 2 on ≥ md (1 col phone). Each: 40 px icon tile (`brand-soft`), `H3` title, `Body` `ink-2` line, button. Top-to-bottom elements:
| E | Component | Copy | → |
|---|---|---|---|
| 1 | `h1` + text | "Practice" · "Choose how you want to practise." | — |
| 2 | Resume bar (conditional) | `brand-soft r:12 p:16`: "{Type} · {chapter} · {n} of {total}" · `primary` sm "Resume" · `ghost` sm "Discard" (confirm dialog) | `/practice/session/{id}` |
| 3 | Quick practice card | "Quick practice" / "Pick a chapter or topic and get feedback after every question." / "Start" | `/practice/new?type=quick` |
| 4 | Chapter test card | "Chapter test" / "Timed, with results at the end. Like the real thing." / "Set up test" | `/practice/new?type=test` |
| 5 | Review queue card | "Review queue" / count "{n} due" or "Nothing due" / "Questions you miss come back here at the right time." / "Start review" (disabled at 0; guest → sign-in sheet) | `/practice/review` |
| 6 | Weak topics card | lists up to 2 weakest topics or "Answer a few questions first" / "Practise" (disabled until data) | `/practice/new?type=quick&scope=weak` |
| 7 | Chapter list | `h2` "Practise by chapter"; rows: title, "{n} questions", accuracy or "Not tried", `secondary` sm "Practise" | `/practice/new?type=quick&chapter={slug}` |
States: loading skeleton cards; no questions at all: EmptyState "Questions are being prepared." Guest: Review card shows sign-in note; everything else works on the device.

## 2 · Setup `/practice/new`
Single narrow card (max 560) on `canvas`; phone full width. Top to bottom:
| E | Component | Copy / options |
|---|---|---|
| 1 | Back + `h1` | "← Practice" · "Set up quick practice" / "Set up chapter test" |
| 2 | Type SegmentedControl | "Quick practice" \| "Chapter test" (switchable here) |
| 3 | **Scope** (radio cards) | "A chapter" (chapter Select) · "Weak topics" · "Saved questions" · "Questions I missed" (each shows its real count; disabled at 0 with reason) |
| 4 | Chapter Select | live chapters only; label "Chapter" |
| 5 | **How many** (chips) | "10" "20" "30" "All" (default 20; capped by available) |
| 6 | **Difficulty** (chips, multi) | "Easy" "Medium" "Hard" (all on by default) |
| 7 | **Order** (segmented) | quick: "In book order" \| "Shuffled" (default shuffled) |
| 8 | Timer (test only) | Switch "Timed" (default on) + helper "1 minute per question · {n} minutes in total" |
| 9 | Summary line | `Small` `ink-2`: "20 questions from The Living World · 20 minutes" |
| 10 | Button | `primary` lg "Start" | creates a session row (server for signed-in, local for guest) → `/practice/session/{id}` |
Validation: needs ≥ 1 question after filters else inline "No questions match these choices." and Start disabled.

## 3 · Session `/practice/session/[id]`
Focused screen: app sidebar hidden, own top bar. Question card centred (max 720) on `canvas`.
```
┌ SESSION BAR 56 ─────────────────────────────────────────────────────────────┐
│ ✕ Exit   Quick practice · The Living World     7 / 20 ▓▓▓▓░░░   ⏱ 18:42 (test)│
├─────────────────────────────────────────────────────────────┬───────────────┤
│                   ┌ QuestionCard ─────────────────┐          │ PALETTE (test,│
│                   │ …same as the workspace…        │          │ ≥1280 only)   │
│                   └───────────────────────────────┘          │ ①②③④⑤ …      │
│ [Previous]    ● ● ✓ × ○ ○                    [Check / Next]   │ legend        │
└─────────────────────────────────────────────────────────────┴───────────────┘
```
| E | Component | Behaviour |
|---|---|---|
| 1 | Exit | Dialog "Leave this session?" "Your answers are saved. You can resume it from Practice." → `/practice` (session stays `open`) |
| 2 | Title + count | "Quick practice · {chapter}" · "7 / 20" `tabular` |
| 3 | ProgressBar | `brand`, answered/total |
| 4 | Timer (test) | counts down from total; turns `accent` under 5 min, `bad` under 1 min; announced at 10, 5, 1 min only; at 0 auto-submit |
| 5 | QuestionCard | **quick:** same as workspace incl. Check, result block, "Show in NCERT" (→ `/study/{slug}?p=`, new tab). **test:** no result block; Check is replaced by "Save and next"; options stay changeable until submit; "Mark for review" ⚑ toggle |
| 6 | Nav | Previous · dots (quick) · Next; test: "Save and next" primary, "Clear answer" ghost |
| 7 | Palette (test) | ≥ 1280 right column; < 1280 behind a "Questions" button → Sheet. Numbered 36 px squares: answered `bg:brand text:white`, flagged `accent-soft` + ⚑, current `b:brand 2px`, unanswered `bg:surface b:line` |
| 8 | Submit (test) | `primary` "Submit test" in session bar → Dialog "Submit now?" summary "{a} answered · {u} not answered · {f} marked for review" · buttons "Keep going" / "Submit" |
Keys: as workspace, plus `F` flag (test), `←/→` previous/next in test. Session autosaves each answer (server for signed-in, IndexedDB for guest). Test answers are **not revealed** until submit (needs server-held answer key; spec'd with the chapter-test data contract, see decision 50 open item).
End of quick session → result. Last question + Next → "Finish" → result.
States: loading skeleton card; offline continues locally; expired/invalid id → 404 with "Back to Practice".

## 4 · Result `/practice/session/[id]/result`
```
┌ ← Practice            Chapter test · The Living World ───────────────────────┐
│        ◜ 22/30 ◝          ┌ Correct 22 ┐ ┌ Missed 6 ┐ ┌ Skipped 2 ┐ ┌ Time 24:40 ┐│
│        73 %               └────────────┘ └──────────┘ └───────────┘ └────────────┘│
│ By topic                                         Missed questions               │
│  Taxonomic categories ▓▓▓▓▓▓▓▓ 80 %              Q7 · p.6  Which of … [Show in NCERT]│
│  Nomenclature        ▓▓▓▓▓░░░ 50 %              Q19 · p.9 …                    │
│ [Review all answers]  [Retry the ones I missed]  [Done]                         │
└──────────────────────────────────────────────────────────────────────────────┘
```
| E | Component | Copy / style |
|---|---|---|
| 1 | Header | `h1` "Your result" `H1` + subtitle `Small` |
| 2 | ProgressRing | 120 px, centre "22 / 30" `H2`, label "73 %" |
| 3 | Stat tiles ×4 | Correct · Missed · Skipped · Time (tabular) |
| 4 | By topic | rows with ProgressBar (`good`/`accent`/`bad` by band) + "{p} %" · sorted weakest first |
| 5 | Missed list | per row: number, page, 2-line stem, `secondary` sm "Show in NCERT" |
| 6 | Buttons | `primary` "Retry the ones I missed" (creates a new quick session) · `secondary` "Review all answers" (read-only walk-through with explanations) · `ghost` "Done" → `/practice` |
Every question answered wrongly on its first attempt in a session automatically enters the review queue ("Added {n} questions to your review queue" line under the buttons, `Small` `muted`).
Empty/edge: 0 correct → encouraging copy "Every miss is now in your review queue." ; abandoned (time ran out) shows "Time's up — we submitted your answers."

## 5 · Review queue `/practice/review` (signed-in)
Guest: Sheet "Sign in to use the review queue" (reason: it needs your history across days).
```
┌ ✕ Exit            Review · 3 of 7 due ─────────────────────────────────────┐
│                   ┌ QuestionCard ───────────────────┐                      │
│                   │ Missed 3 days ago                │                      │
│                   │ stem … options …                 │                      │
│                   └──────────────────────────────────┘                      │
│   after Check:  How well did you know it?                                    │
│   [ Again · 1 day ] [ Hard · 3 days ] [ Good · 7 days ] [ Easy · 14 days ]  │
└──────────────────────────────────────────────────────────────────────────────┘
```
Scheduling (Leitner, boxes 1–6 = 1, 3, 7, 14, 30, 60 days): wrong answer → box 1 ("Again" auto-selected, only Again offered); correct → student picks Hard (stay in box), Good (+1), Easy (+2). Buttons show the real next interval. A question leaves the queue after passing box 6 twice. Due = `due_at <= now`.
Elements: Exit; title "Review · {i} of {n} due"; ProgressBar; QuestionCard (chip "Missed {x} days ago"); after Check the result block + the four rating buttons (`secondary`, `Good` highlighted `primary`) replacing the footer; "Show in NCERT" available.
End screen: `good` check, "Review done", "{n} reviewed · next review {tomorrow|in n days|—}", buttons `primary` "Back to Home" / `ghost` "Practise more".
Empty: EmptyState "Nothing due. Questions you miss come back here at the right time." + `secondary` "Start quick practice".

## Colour, type, i18n
Same tokens/roles as the workspace; timer `Label` tabular; palette squares `Label`. i18n prefix `practice.*`.

## Where every click goes
Hub cards → setup/review · Resume → session · Setup Start → session · Exit → Practice · Submit → result · Missed → "Show in NCERT" → workspace at page (new tab) · Retry missed → new session · Done → `/practice` · Review end → `/home` or `/practice/new`.
