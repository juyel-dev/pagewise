# 01 · Landing `/`

**Picture.** A calm, confident one-page introduction. In ten seconds a student understands: *you read the NCERT page on one side, practise that page's questions on the other, and jump to the source when you miss one.* It is free, needs no account, and works on a phone. Signed-in visitors are redirected to `/home`.
**Sections, top to bottom:** Header · Hero · Trust strip · How it works · Features · Subjects · FAQ · Final call · Footer. Section backgrounds alternate `canvas` / `surface` so the page has rhythm without heavy dividers. Section vertical padding 80 (phone) / 112 (desktop). Content width: `Container` max 72 rem, side padding 20 / 32.

## Wireframe — desktop 1280
```
┌ HEADER (64, sticky) ────────────────────────────────────────────────────────┐
│ ◆ Pagewise   How it works  Subjects  FAQ                 🌐 EN  ◐  Sign in [Start studying] │
├ HERO (bg canvas) ───────────────────────────────────────────────────────────┤
│ [NEET UG · Biology first]                  ┌──────────────┬────────────────┐ │
│                                            │ Question  p.4│ ▒▒▒▒▒▒▒▒▒▒▒▒▒  │ │
│ Read the NCERT page.                       │ Which tissue │ ▒▒▒▒▒▒▒▒▒▒▒    │ │
│ Practise its questions.                    │ ○ A  ○ B     │ ░░░░░░░░░░░░░  │ │
│                                            │ ● C  ○ D     │ ▒▒▒▒▒▒▒▒       │ │
│ Every question is tied to the exact page   │ ✓ Correct…   │ ▒▒▒▒▒▒▒▒▒▒▒    │ │
│ it comes from. Read on one side, practise  └──────────────┴────────────────┘ │
│ on the other, jump to the source when you                                    │
│ miss one.                                                                    │
│ [Start studying — it's free]  [See how it works]                             │
│ No sign-up needed · No ads · Works on your phone                             │
├ TRUST STRIP (bg surface, borders) ──────────────────────────────────────────┤
│  ✓ Free to use   ✓ No ads   ✓ No tracking cookies   ✓ Made for NEET UG       │
├ HOW IT WORKS (#how, bg canvas) ─────────────────────────────────────────────┤
│                     How Pagewise works                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                                  │
│  │ ① 📖     │   │ ② 🎯     │   │ ③ 🔗     │                                  │
│  │ Open a   │   │ Practise │   │ Jump to  │                                  │
│  │ chapter  │   │ this page│   │ the source│                                 │
│  └──────────┘   └──────────┘   └──────────┘                                  │
├ FEATURES (bg surface) ──────────────────────────────────────────────────────┤
│  six cards, 3 × 2        + "Coming soon" chip row                            │
├ SUBJECTS (#subjects, bg canvas) ────────────────────────────────────────────┤
│  Biology (live)   Physics (soon)   Chemistry (soon)                          │
├ FAQ (#faq, bg surface) ─────────────────────────────────────────────────────┤
│  8 accordion rows                                                            │
├ FINAL CALL (bg brand-soft) ─────────────────────────────────────────────────┤
│  Open your first chapter  [Start studying]                                   │
├ FOOTER ─────────────────────────────────────────────────────────────────────┤
└──────────────────────────────────────────────────────────────────────────────┘
```
**Phone 390:** everything in one column; hero visual drops below the CTAs and shows only the question card (PDF half hidden); How it works and Features become vertical stacks; Subjects a horizontal scroll-snap row; FAQ full width; Final call stacked; header per `00-tour.md` §2.1.

## S1 · Header
As `00-tour.md` §2.1. On landing, `How it works` → `#how`, `Subjects` → `#subjects`, `FAQ` → `#faq`.

## S2 · Hero
Layout: 2 columns ≥ 1024 (copy 5/12, visual 7/12), gap 64, vertical padding 96 top / 80 bottom; one column below, copy first.
| E | Component | Copy / style | → |
|---|---|---|---|
| H1 | Chip | "NEET UG · Biology first" · `bg:brand-soft` `brand-text` `type:Caption` `r:full` `p:6/12` | none |
| H2 | Heading `h1` | "Read the NCERT page. Practise its questions." · `type:Display` `ink` · line break after the first sentence on ≥ sm · `text-balance` | none |
| H3 | Paragraph | "Every question is tied to the exact page it comes from. Read on one side, practise on the other, and jump to the source the moment you get one wrong." · `type:Lede` `ink-2` · max 36 rem · `mt:20` | none |
| H4 | Button | "Start studying — it's free" · `primary` lg · `mt:32` | `/study` (guest, no sign-in) |
| H5 | Button | "See how it works" · `secondary` lg · beside H4 (below on phone, full width) | scroll `#how` |
| H6 | Text | "No sign-up needed · No ads · Works on your phone" · `type:Small` `muted` · `mt:16` | none |
| H7 | **Product preview** | Card `bg:surface b:line r:24 sh:window p:12`, two panes, 1 px divider. **Left: a real `QuestionCard`** rendered with a static sample question from `config/landing-sample.ts` (owner approves the question): label "Sample question · Class 11 Biology", options, **option C shown selected and ✓ Correct** with the explanation line and "From the page". **Right: an abstract book page** (lines of grey bars, one highlighted bar in `accent-soft` with 2 px `accent` outline, page number "p. 4" in the corner). A caption under the card, `type:Caption` `muted`: "The highlighted line is what “Show in NCERT” takes you to." No real NCERT text or screenshot is used (decision 48 until permission is handed over). | Not interactive; decorative `aria-hidden` except the caption |
Hero background: flat `canvas`; one soft radial `brand-soft` glow behind the preview (static, 600 px, 40 % opacity). No animation.

## S3 · Trust strip
Full-width band, `bg:surface`, top and bottom `b:line`, vertical padding 20. Four items in a row (2 × 2 on phone): ✓ icon (`good`, 16 px) + `type:Label` `ink`: "Free to use" · "No ads" · "No tracking cookies" · "Made for NEET UG". No links.

## S4 · How it works (`#how`)
Heading `h2` "How Pagewise works" (`type:H1`, centred), lede "Three steps. No setup." (`type:Lede` `ink-2`). Three cards (`Card flat`, `r:16 p:24 gap:12`), equal height, connected on desktop by a thin dotted line behind number badges.
| Card | Badge | Icon (24, `brand`) | Title (`H3`) | Text (`Body` `ink-2`) |
|---|---|---|---|---|
| 1 | "1" in 28 px circle `bg:brand` white | book-open | "Open a chapter" | "Pick your subject and class. The NCERT chapter opens on one side." |
| 2 | "2" | target | "Practise the page you're on" | "Questions for that exact page appear beside it. Answer, check, move on." |
| 3 | "3" | link | "Jump to the source" | "Missed one? One tap scrolls the book to the line the question came from." |
Below the cards a centred secondary link-button "Start studying →" → `/study`.

## S5 · Features
`bg:surface`. Heading "Built for studying, not scrolling" (`H1`), lede "Everything is there to help you read, practise and remember." Grid 3 × 2 (2 × 3 tablet, 1 col phone), `gap:16`. Each card: icon tile 40 px (`bg:brand-soft`, icon `brand-text`), `H3` title, `Body` `ink-2` text.
1 **Questions tied to pages** — "Each question belongs to a specific page of the chapter, so practice always matches what you just read."
2 **A proper NCERT reader** — "Zoom, jump to a printed page number, invert pages for night reading, and resize the panels to suit you."
3 **Explanations with the source line** — "Every answer comes with an explanation and the line from the book it is based on."
4 **Works without an account** — "Open any chapter and start. Your progress stays on your device until you choose to sign in."
5 **Your place is remembered** — "Pick up exactly where you stopped, on any device once you sign in."
6 **Made for focus** — "Keyboard shortcuts, dark mode and a layout with nothing to distract you."
Under the grid: a row **"Coming soon"** (`type:Label` `muted`) followed by chips (`b:line`, `type:Caption`): "Chapter tests", "Mistake notebook", "Spaced review", "Hindi and Bengali". Driven by `config/roadmap-teasers.ts`; empty array hides the row.

## S6 · Subjects (`#subjects`)
`bg:canvas`. Heading "Start with Biology" (`H1`), lede "More subjects are on the way." Three cards in a row (scroll-snap on phone, 280 px wide). Each: top tinted block 96 px (Biology `good-soft`, Physics `brand-soft`, Chemistry `accent-soft`) with a 40 px icon; `H3` subject; `Small` `ink-2` "Class 11 and 12 · NCERT"; status chip; footer button.
| Card | Chip | Line | Button |
|---|---|---|---|
| Biology | `good` "Live" | "{n} chapter(s) ready" where n = live chapters from DB (hidden if 0) | `primary` "Start Biology" → `/study?subject=Biology` |
| Physics | `accent` "Coming soon" | "We're preparing it." | `secondary` disabled "Coming soon" |
| Chemistry | `accent` "Coming soon" | "We're preparing it." | disabled |

## S7 · FAQ (`#faq`)
`bg:surface`. Heading "Questions you might have" (`H1`). Accordion, one open at a time, rows `b-bottom:line`, question `type:H3`, chevron rotates 150 ms, answer `Body` `ink-2` max 44 rem. Web semantics: `<details>`-style buttons with `aria-expanded`.
1 **Is Pagewise free?** "Yes. Every chapter and question is free to use."
2 **Do I need an account?** "No. You can study as a guest. Your progress stays on this device. Sign in with Google when you want it on every device."
3 **Where do the questions come from?** "They are written for the exact pages of the NCERT chapter and checked before they are published."
4 **Which subjects and classes are available?** "Biology for Class 11 is live and growing. Class 12, Physics and Chemistry are coming."
5 **Can I read the NCERT chapter inside Pagewise?** "Yes, in the built-in reader. See Content and NCERT for how the books are used." → `/legal/content`
6 **Does it work on my phone?** "Yes. On a phone, Read and Practise are two tabs."
7 **Do you track me?** "We don't use advertising trackers or tracking cookies."
8 **What happens to my progress if I clear my browser?** "As a guest, it is removed with your browser data. Sign in to keep it safe."
Answers 3 and 5 final wording follows the owner's legal text (decision 48).

## S8 · Final call
`bg:brand-soft`, `r:24` card inset on desktop (margin 20), padding 48. Centred `H1` "Open your first chapter", `Lede` "It takes less than a minute to start.", buttons `primary` lg "Start studying" → `/study` and `ghost` lg "Sign in" → `/sign-in`.

## S9 · Footer — `00-tour.md` §2.3.

## States
Loading: page is static; only the Subjects "{n} chapters ready" line streams (skeleton text 120 × 14). Error in that fetch: line hidden. Signed-in: redirect to `/home` before render. Reduced motion: no scroll animation (jump).

## Colour, type, i18n
Colours only from tokens; no gradients except the single static glow. Heading hierarchy: one `h1` (hero), `h2` per section. i18n prefix `landing.*`; hero H1 may wrap to three lines in Bengali, so the hero copy column has no fixed height. `config/landing-sample.ts` holds one sample question per language.

## Where every click goes
Logo → `/` · How it works / Subjects / FAQ → anchors · Language → locale · Theme → toggle · Sign in → `/sign-in` · Start studying (header, hero, final call, how-it-works link, Biology card) → `/study` or `/study?subject=Biology` · See how it works → `#how` · FAQ 5 link → `/legal/content` · Footer → Study `/study`, Learn anchors, Help `/help`, Contact `mailto:`, Legal pages.
