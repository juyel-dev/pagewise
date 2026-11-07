# 05 · Study hub `/study`

**Picture.** A clean chooser. At the top the student picks subject and class; below, the chapters of that book appear as cards grouped by unit, each saying clearly whether it is ready, how many questions it has and how far the student has read. One click opens the workspace.

## Wireframe — desktop
```
┌ top bar: Study ─────────────────────────────────────────────────────────────┐
│ Study                                                                        │
│ Choose a chapter to read and practise.                                       │
│ [ Biology | Physics·Soon | Chemistry·Soon ]   [ Class 11 | Class 12 ]  🔍 Search │
│ 1 chapter ready · 1 in preparation                                           │
│ Unit 1 · Diversity in the Living World                                       │
│ ┌ cover 96 ─────────┐ ┌ cover ───────────┐ ┌ cover ───────────┐             │
│ │ 01     [Live]     │ │ 02 [Soon]        │ │                  │             │
│ │ The Living World  │ │ Biological Class.│ │                  │             │
│ │ 9 pages · 171 q   │ │ Being prepared   │ │                  │             │
│ │ ▓▓▓░░ 3 of 9 read │ │                  │ │                  │             │
│ │ [Continue]        │ │ [Notify me?]     │ │                  │             │
│ └───────────────────┘ └──────────────────┘ └──────────────────┘             │
│ Unit 4 · Structural Organisation in Animals and Plants   (more units …)      │
│ Not finding a chapter? Tell us →                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```
**Phone:** filters stack (subject chips scroll horizontally, class segmented control below, search collapses to an icon that expands); cards 1 column.

## Top to bottom
### S1 · Header block
| E | Component | Copy / style |
|---|---|---|
| 1 | `h1` | "Study" `type:H1` |
| 2 | Text | "Choose a chapter to read and practise." `type:Body` `ink-2` |

### S2 · Filter bar (`mt:24`, sticky under the top bar on scroll, `bg:canvas` with bottom `line`)
| E | Component | Copy / behaviour |
|---|---|---|
| 1 | SegmentedControl (subject) | "Biology" · "Physics" · "Chemistry"; subjects without live chapters show a small "Soon" chip and are selectable (shows the coming-soon state) |
| 2 | SegmentedControl (class) | "Class 11" · "Class 12" |
| 3 | Search input | `md`, `r:10`, placeholder "Search chapters", icon left; filters the visible cards by title/unit (client-side), clear "×" |
| 4 | Summary line | `type:Small` `muted`: "{n} chapters ready · {m} in preparation" (counts from data) |
Selection is saved (`setStudyPrefs`, local for guests) and mirrored in the URL (`?subject=&class=`); first visit defaults to Biology / Class 11 (or the profile class).

### S3 · Unit groups
For each unit in book order: `h2` "Unit {n} · {title}" (`type:H2`, `mt:32`) then a grid (`gap:16`; 3 columns ≥ 1024, 2 ≥ 640, 1 below).

### S4 · ChapterCard (spec)
`Card interactive p:0 r:16 overflow-hidden`; the whole card is one link.
| Zone | Content / style |
|---|---|
| Cover | 96 px tall block tinted by subject; chapter number `type:Display` (40 px) `brand-text`/`good`; top-right status chip |
| Body (`p:20`) | `h3` chapter title (max 2 lines, `type:H3`); unit/meta `Small` `ink-2` ("Class 11 · Unit 1"); stats row `Small` `muted`: "9 pages · 171 questions" |
| Progress | ProgressBar + `Small` "3 of 9 pages read"; if not started: `Small` "Not started" (no bar) |
| Footer | Button: **Live & not started** → `primary` "Start"; **in progress** → `primary` "Continue"; **complete (all pages read)** → `secondary` "Review"; **in preparation** → `secondary` disabled "Coming soon" |
Chips: `good` "Live"; `accent` "Coming soon"; staff only `accent` "Draft". States: hover `surface-2` + cover slightly darker; pressed scale 0.99; focus ring; disabled card at 70 % opacity, not a link.

### S5 · Footer note
Centred `type:Small` `muted`: "Not finding a chapter?" + link "Tell us" → `/help#feedback`.

## States
Loading: filter bar real; three card skeletons per unit. No chapters for the selection (e.g. Class 12): EmptyState "Class 12 Biology is being prepared." + `Small` "We'll add chapters as soon as they're reviewed." + `secondary` "See Class 11". Subject Physics/Chemistry: EmptyState "{Subject} is coming soon." + same helper. Search without results: "No chapters match “{query}”." + "Clear search". Error: "We couldn't load the chapters." + "Try again". Offline: cached list + offline pill; opening a chapter not cached shows the workspace offline state.

## Colour, type, i18n
Page `bg:canvas`; cards `surface`; subject tints as in `04-home.md`. i18n prefix `study.hub.*`; unit and chapter titles come from content (not translated).

## Where every click goes
Card/Start/Continue/Review → `/study/{slug}` (resumes last page) · Subject/Class → same page, new filter · Tell us → `/help#feedback` · Staff Draft chip card → workspace (draft) for staff only.
