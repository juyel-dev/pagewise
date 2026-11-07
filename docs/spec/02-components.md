# 02 · Component specifications

All components use tokens only (see `frontend/01-design-foundations.md`). Each lives in `apps/web/src/components/ui/` unless noted. **Exists** = already in the repo (may need to be brought to this spec). Sizes: `sm` 32 px, `md` 40 px, `lg` 48 px controls (touch contexts use `lg` or ≥ 44 px hit area).

## A. Foundations

### Button / ButtonLink — Exists
Variants `primary` (brand fill, white text), `secondary` (surface, `control-border` outline), `ghost` (transparent, ink-2). Sizes `md`, `lg` (+ `sm` to add). States: hover (`brand-hover` / `surface-2`), pressed (translate-y 0, darker), focus ring, disabled (50 %), loading (spinner replaces label, width fixed, `aria-busy`). Full-radius pill. Props: `variant`, `size`, `loading`, `leadingIcon`, `trailingIcon`, native button props; `ButtonLink` wraps `next/link`.

### IconButton — To build
Square (`sm|md|lg`), `aria-label` required, tooltip on hover/focus, `variant` ghost|secondary. Hit area ≥ 44 px on touch.

### Chip — To build
Pill 32 px: label, optional count, optional icon. `selected` → `brand-soft` bg, `brand-text`, border `brand`. Used for filters and page rail. Props: `selected`, `count`, `onClick`, `href`.

### SegmentedControl — To build
2–4 options in a pill track (`surface-2`), selected segment `surface` with shadow-card. Radio-group semantics, arrow keys move, one tab stop. Props: `options[{value,label,icon?}]`, `value`, `onChange`, `size`.

### Tabs — To build
Underline tabs (`brand` 2 px indicator). `role=tablist`, arrow-key nav, panels `hidden` when inactive. Mobile Read/Practise uses this.

### Card — To build
`surface`, 1 px `line`, radius 16, padding 16/20/24 (`sm|md|lg`). Variants `flat` (no shadow), `raised` (`shadow-card`), `interactive` (hover `surface-2`, whole card is one link/button). Slots: header, body, footer.

### Input / Select / Textarea — To build (native elements styled)
Visible label above, 40 px, fill `field`, border `control-border`, radius 8, focus ring. Helper text 13 px `muted`; error text `bad` with icon + `aria-describedby`; `aria-invalid`. Never placeholder-as-label.

### Checkbox / Switch — To build
Native checkbox visually enhanced; Switch = `role=switch`, 44 × 24 track. Label clickable; 44 px hit area.

### ProgressBar — To build
Track `surface-2` (or `line`), fill `good` (completion) or `brand` (neutral); height 6 px, radius full; `role=progressbar` with `aria-valuenow/min/max` and text label nearby. No animation > 200 ms.

### ProgressRing — To build
SVG ring 64–96 px, stroke 8, `brand` over `surface-2`; centre text = percent or `n/m`; `role=img` with full-sentence label.

### Skeleton — To build
`surface-2` blocks with 1.4 s shimmer (off under reduced motion). Variants: text line, block, card, chip row. Must match the loaded layout dimensions (no shift).

### EmptyState — To build
Centred: 24 px line icon, title (H3), one sentence (`ink-2`), optional single action (Button). No illustrations.

### StatusPage — Exists
Full-page error/404/offline message (code, title, body, actions). Extend with `offline` variant.

### Toast — To build
Bottom-centre (desktop) / above bottom bar (mobile), 60 z-layer, auto-dismiss 4 s (errors 8 s, with action: no auto-dismiss), `role=status` (`alert` for errors), pause on hover/focus, max 3 stacked. Variants: neutral, success, error.

### Dialog — To build
Centred 480 px (max 90 vw), backdrop 50 % ink, focus trap, Esc closes (unless destructive-in-flight), returns focus, title + description via `aria-labelledby/describedby`. Destructive confirmation pattern: primary button is the *safe* action unless user typed a confirm word.

### Sheet — To build
Mobile bottom sheet (80 % max height, grab handle, drag-down closes) and right-side drawer on desktop. Same a11y as Dialog.

### Tooltip — To build
Appears on hover/focus after 400 ms, 12 px text, never carries essential information.

## B. App shell

### AppShell — Exists
Dark sidebar 220 px (≥ `lg`), drawer below; nav from `config/nav.ts`; header 56 px with search trigger, theme toggle, account menu (or "Sign in" for guests). Esc closes drawer, focus restored, scroll locked.

### GuestBanner — To build
Single-line soft prompt inside the workspace pane and Home: "You're studying as a guest. Sign in to keep progress on all your devices." + "Sign in" link + dismiss (remembered per session). Never blocks interaction.

### Breadcrumb / BackLink — To build
Back link = ghost button "← Study". Workspace shows `Subject · Class · Chapter` as quiet text next to it.

## C. Study components

### PageChipRail — To build
Horizontal scroll row of Chips, one per PDF page that has questions: label `p.{printed}` + question count; current page selected; keyboard `←/→` within rail; click scrolls PDF to the page. Shows "answered/total" as a tiny `good` dot when complete.

### QuestionCard — Exists (to restyle)
Anatomy: header (topic chip, difficulty chip, question number "2 of 4", bookmark IconButton) → stem (16 px) → optional match-columns → options → actions → result block.
Options: row buttons min-height 48, left key badge (`1–4` for MCQ; `A–D` label retained in text), radius 12; states `idle | hover | selected | correct | incorrect | missed-correct | disabled`. Multi-select shows "Select all that apply" and checkboxes. Result block (after Check): banner "Correct." / "Not quite." (+ icon), explanation, "From the page: “…”" (source_text), actions `Show in NCERT`, `Try again`. Keys: `1–4`/`A–D` choose, `Enter` check, `N` next, `B` bookmark, arrows move within radio group.

### QuestionDots — Exists inline
Row of 24 px dots: current (brand), correct (✓ good), incorrect (× bad), unanswered (•). Each is a button with a full-sentence `aria-label`.

### PageSummary — To build
After the last question of a page is checked: Card with "Page complete", `n of m correct`, ProgressBar, actions `Retry wrong ones`, `Next page with questions`, `Keep reading`.

### SplitPane — To build (extract from workspace)
Two panes with a 12 px draggable separator (`role=separator`, keyboard ← → 2 % steps, Home/End min/max, double-click reset). Min widths 320/360 px. Ratio persisted in prefs. Props: `left`, `right`, `ratio`, `swapped`, `onRatioChange`.

### PdfToolbar — To build (extract)
Previous/next page, "PDF n/N · printed X", go-to-printed-page input, zoom −/%/+, Invert pages, Swap sides, Hide/Show PDF. Overflow "More" menu below `lg`.

### PdfViewer — Exists (to optimise)
PDF.js canvas + text layer; lazy page sizes; mixed page sizes; render window ±2 pages; highlight API `highlight(pageNumber, text)`; states loading (skeleton page), error (retry), empty. Handle: `scrollToPage`, `highlight`.

### ThumbnailStrip — To build (later, H5)
72 px column of page thumbnails with question-count dots.

### SourceQuote — To build
`accent-soft` block, 13 px, left border `accent`, text "From the page: “…”"; truncates at 3 lines with "more".

### KeyHint — To build
`<kbd>` chip (12 px, `surface-2`, border `line`) used in tooltips and the footer hint row. Hidden on touch devices.

## D. Home / hub / lists

### StatTile — To build
Card with label (13 px `muted`), value (28 px, tabular), optional delta/sub text. Value is real or an honest dash.

### ChapterCard — To build
Card: subject-tinted header block with chapter number, title (H3), unit (13 px muted), status chip (Live/Draft staff only), question count, ProgressBar + "n of m pages", primary "Study"/"Continue" button. Entire card is one link target; button label reflects state.

### ContinueCard — To build
Large card: eyebrow "Continue reading", chapter title, "page n of N", ProgressBar, primary "Resume page n".

## E. Rules for all components

1. Document props with TypeScript types and a one-line JSDoc; no `any`.
2. Every state above has a story/test (Vitest + Testing Library); interactive ones have keyboard tests.
3. No component imports from `features/` (lint-enforced).
4. New variants require a spec change first.
