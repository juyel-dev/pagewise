# 06 · Study workspace `/study/[chapter]?p=`

**Picture.** The heart of Pagewise. The NCERT chapter sits on one side; the questions for the page you are reading sit on the other. You read, you answer, you check, and when you miss one a single tap takes the book to the exact line. It fills the screen, has no page scroll, and every control is within easy reach. Behaviour, keyboard map, analytics and acceptance tests are in `docs/spec/screens/S05-study-workspace.md`; **this file is the visual truth**.

## 1 · Desktop ≥ 1024 — five moments

Region sizes: header 48 · split 45 / 12 / 55 (min 320 / 360) · PDF toolbar 44 · practice pane padding 20 · question card max width 720.

### Moment A — page opens, nothing answered
```
┌ app top bar 56 ─────────────────────────────────────────────────────────────┐
├ HEADER 48 ───────────────────────────────────────────────────────────────────┤
│ ← Study │ Biology · Class 11 · The Living World │ 3 of 9 pages read ▓▓▓░░░░░░ │
├──────────────────────────────────┬─┬────────────────────────────────────────┤
│ [p.3·5] [p.4·4▪] [p.6·3] [p.7·6] …│ │ ‹ PDF 4/9 · printed 77 ›  [Go to page] − 100% + │
│ ───────────────────────────────── │ │ Invert ○  Swap  Hide                    │
│ [Focus | List]   Follow my reading ◉│ ├────────────────────────────────────────┤
│ Reading: PDF page 4 · printed 77   │ │                                        │
│ ┌ QUESTION ──────────────────────┐│ │    ┌────────────────────────────┐      │
│ │ [Tissues] [Medium]   2 of 4  ☆ ││ │    │  NCERT page 4              │      │
│ │ Which tissue gives mechanical  ││ │    │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    │      │
│ │ support to young stems…?       ││ │    │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒         │      │
│ │ ┌─────────────────────────────┐││ │    │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       │      │
│ │ │ [1] Parenchyma              │││ │    │                            │      │
│ │ │ [2] Collenchyma             │││ │    └────────────────────────────┘      │
│ │ │ [3] Sclerenchyma            │││ │                                        │
│ │ │ [4] Phloem fibres           │││ │                                        │
│ │ └─────────────────────────────┘││ │                                        │
│ │ [ Check ]  (disabled)          ││ │                                        │
│ └────────────────────────────────┘│ │                                        │
│ ─ ─ ─ sticky ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ │                                        │
│ [Previous]  ● ○ ○ ○   [Next]      │ │                                        │
│ 1–4 choose · Enter check · N next │ │                                        │
└──────────────────────────────────┴─┴────────────────────────────────────────┘
```
### Moment B — an option is selected
Option 3 row: `b:brand`, `bg:brand-soft`, key badge `bg:brand` white. "Check" becomes enabled (`primary`).
### Moment C — checked, correct
```
│ │ [1] Parenchyma                                      │
│ │ [2] Collenchyma   ✓ Correct answer     (good-soft)  │
│ │ [3] Sclerenchyma                                    │
│ │ ┌ RESULT (surface-2) ─────────────────────────────┐ │
│ │ │ ✓ Correct.                                      │ │
│ │ │ Collenchyma cells are thickened at the corners… │ │
│ │ │ ┃ From the page: “… support to young stems …”   │ │
│ │ │ [Show in NCERT]  [Try again]                    │ │
│ │ └─────────────────────────────────────────────────┘ │
│ [Previous]  ✓ ● ○ ○   [Next question]  ← primary now │
```
### Moment D — checked, wrong
The picked option: `b:bad bg:bad-soft` ✗ "Your answer"; the right one `good` ✓ "Correct answer"; result banner "✗ Not quite." (`bad`). Tapping **Show in NCERT** scrolls the PDF to the page and paints the source line: `bg:accent-soft` with a 2 px `accent` outline for 6 s; the PDF pane's toolbar flashes the page label once.
### Moment E — last question checked, Next pressed (Page complete)
```
│ ┌ PAGE COMPLETE ───────────────────────────┐ │
│ │ ✓  Page complete                          │ │
│ │ 3 of 4 correct   ▓▓▓▓▓▓▓▓░░               │ │
│ │ [Next page with questions →]  (primary)   │ │
│ │ [Retry the ones you missed] [Keep reading]│ │
│ └───────────────────────────────────────────┘ │
```

## 2 · Phone < 1024
```
Practise tab                          Read tab
┌──────────────────────────┐          ┌──────────────────────────┐
│ ← Study  The Living World│          │ ← Study  The Living World│
│ [   Read   |  Practise  ]│          │ [   Read   |  Practise  ]│
│ [p.3·5][p.4·4][p.6·3] → │          │ ‹ 4/9 · 77 ›  − 100% + ⋯ │
│ [Focus|List]  Follow ◉   │          │ ┌──────────────────────┐ │
│ ┌ question card ───────┐ │          │ │   NCERT page         │ │
│ │ …                    │ │          │ │   (full width)       │ │
│ └──────────────────────┘ │          │ └──────────────────────┘ │
│ ─────────────────────────│          │                          │
│ [‹] [   Check   ] [ 🔗 ] │ ← sticky └──────────────────────────┘
└──────────────────────────┘   64 px bottom action bar (no tab bar here)
```
Sticky bottom action bar: left IconButton "Previous"; centre **primary** button that reads `Check` → `Next question` → `Next page`; right IconButton "Show in NCERT" (after check). Respects `safe-area-inset-bottom`. Read tab: toolbar collapses to page chevrons, page label, zoom, "⋯" (Invert, Go to page, Hide). Tapping "Show in NCERT" switches to Read and highlights.

## 3 · Elements, top to bottom (visual spec)

### Workspace header (48, `bg:surface`, bottom `line`, `p:0/16`, `gap:12`)
| E | Component | Copy / style |
|---|---|---|
| 1 | BackLink | "← Study" `ghost` sm; phone shows only "←" with label for screen readers |
| 2 | Text | "Biology · Class 11 · The Living World" `type:Label` `ink`, truncates; subject/class part `ink-2` |
| 3 | Chip | staff only "Draft" `accent` |
| 4 | Progress | right-aligned: 96 px ProgressBar (`good`) + `Small` "3 of 9 pages read"; hidden < md |

### Practice pane (left; `bg:surface`; scrolls; padding 20; stack gap 16)
| # | Element | Style / copy |
|---|---|---|
| 1 | PageChipRail | sticky top of the pane, `bg:surface`, bottom `line` on scroll; chips 32 px, `Caption`: "p.4 · 4"; selected `brand-soft/brand-text/b:brand`; completed pages get a 6 px `good` dot; horizontal scroll with fade edges |
| 2 | Controls row | SegmentedControl "Focus / List" (left); Switch "Follow my reading" (right) with `Small` label |
| 3 | Caption | "Reading: PDF page 4 · printed page 77" `Small` `muted`, `aria-live=polite` |
| 4 | GuestBanner | guests; `brand-soft`, once per session, dismissible |
| 5 | FollowChip | conditional: "Page 5 has 4 questions — Switch" (`accent-soft`) |
| 6 | QuestionCard or PageSummary or EmptyState | below |
| 7 | Sticky nav | `bg:surface`, top `line`, `p:12/20`: "Previous" `secondary`; QuestionDots; "Next question" `secondary` (→ `primary` once checked) |
| 8 | KeyHint row | desktop only; `Caption` `muted`; keycaps 12 px |

### QuestionCard (inside the pane): `bg:surface b:line r:16 p:20 gap:16`
1. **Header row:** topic Chip (`surface-2`, `Caption`), difficulty Chip (`Easy` `good-soft`, `Medium` `accent-soft`, `Hard` `bad-soft`), spacer, `Small` "2 of 4", IconButton ☆/★ "Save question".
2. **Stem:** `type:Question` `ink`, max 65 ch; line breaks preserved.
3. **Match-the-column** (if present): two columns in `bg:surface-2 r:12 p:12`, items `Body`, stacks on narrow panes.
4. **Hint:** multi-select only, `Small` `muted`: "Select all that apply."
5. **Options:** column, gap 8. Row: `min-h:52 p:12/14 r:12 b:line bg:surface`; left key badge 28 × 28 `r:8 bg:surface-2` `Label` (digit); text `Body`; hover `bg:surface-2`; pressed `scale 0.99`; selected `b:brand bg:brand-soft` + badge `bg:brand` white; after check correct `b:good bg:good-soft` + trailing "✓ Correct answer" `good` `Label`; wrong pick `b:bad bg:bad-soft` + "✗ Your answer" `bad`; locked options 100 % opacity (not dimmed).
6. **Actions:** before check: `primary` md "Check" (disabled until a choice). After check: replaced by the result block.
7. **Result block:** `bg:surface-2 r:12 p:16 gap:12` · banner icon + "Correct." (`good`, 600) or "Not quite." (`bad`, 600) · explanation `Body` `ink-2` · SourceQuote (`accent-soft`, 3 px `accent` left bar, `Small`, "From the page: “…”", 3-line clamp + "more") · actions: `secondary` sm "Show in NCERT" (icon link), `ghost` sm "Try again"; after a retry, `Caption` `muted` "Only your first attempt counts toward your accuracy."

### PDF pane (right; `bg:surface-2`)
| # | Element | Style / copy |
|---|---|---|
| 1 | PdfToolbar 44 | `bg:surface`, bottom `line`; left: IconButton ‹, text "PDF 4/9 · printed 77" `Small` tabular, IconButton ›, Go-to input 96 px "Go to page"; right: zoom −, "100%", +; Switch "Invert pages"; ghost "Swap sides", "Hide PDF" |
| 2 | Viewer | pages centred, 16 px gaps, page shadow `sh:card`, white (or inverted); first paint = skeleton page at correct aspect |
| 3 | Highlight | `bg:accent-soft` + 2 px `accent` outline, 6 s |

### Separator (12 px)
`bg:surface-2`; 4 × 40 px grip `bg:line`; hover/focus `bg:brand-soft`, grip `brand`; cursor `col-resize`.

## 4 · States (visual)
| State | Look |
|---|---|
| Loading | Header real; chips = 5 skeleton pills; card skeleton (chip row, 3 text lines, 4 option bars); PDF skeleton page; no spinners |
| No questions on this page | Centre of pane: line icon (24, `muted`), "No questions on this page", `Small` "The next page with questions is page 6.", `secondary` "Go to page 6" |
| No published questions in chapter | "Questions for this chapter are still being reviewed. Every question is checked before it is published, so none are shown yet. You can read the chapter now." |
| PDF unavailable | Right pane: icon, "Chapter PDF not available yet", `Small` "The NCERT page for this chapter is not published yet." |
| PDF page error | `bad-soft` bar under toolbar: "A PDF page could not be displayed." + "Reload PDF" |
| Offline | pill under top bar; everything keeps working |
| Save failing | toast "Your answer couldn't be saved yet. We'll keep trying." |
| Hide PDF | practice pane centred, card max width 720 |

## 5 · Colour, type, i18n
Backgrounds: header and practice pane `surface`; PDF pane `surface-2`; page `canvas` behind the app bar. All semantic colours (good/bad/accent) always paired with icon + word. Type roles: stem `Question`, options `Body`, chips `Caption`, toolbar `Small`. Question text, explanations and `source_text` come from content (English). All UI strings under `study.workspace.*`; chips and buttons must grow with text; QuestionCard works at 320 px pane width.

## 6 · Where every click goes
← Study → `/study` · Page chip → same page, PDF scrolls · Mode / Follow / Invert / Swap / Hide → local UI state (saved) · ☆ → toggles saved · Option / Check / Try again → local + attempt saved · Show in NCERT → PDF scroll + highlight (phone: Read tab) · Previous/Next → moves question · Page complete buttons → retry misses / next page with questions / list view · Go to page → PDF jump · `?` → shortcuts dialog.
