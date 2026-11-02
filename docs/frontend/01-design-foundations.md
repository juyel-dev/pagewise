# Frontend · Design foundations

**Current implementation snapshot:** 2026-11-02  
**Source of truth:** `src/app/globals.css`, shared components and shipped screens.

These foundations describe the palette and patterns that are actually shipped. The app uses a slate/blue system; older emerald/warm-neutral values are historical and no longer current.

## 1. Design principles

1. **Calm over loud.** Long study sessions; neutral surfaces, one primary brand colour and restrained motion.
2. **Content is the hero.** NCERT pages and questions get the space; app chrome stays compact.
3. **Clarity of state.** Correct, incorrect, selected and disabled states use text or symbols as well as colour.
4. **Keyboard-first on desktop, thumb-first on phone.**
5. **Reuse before inventing.** Keep shared buttons, spacing, surfaces and focus treatment consistent.
6. **Accessible by default.** WCAG 2.2 AA contrast targets are the baseline; automated token checks do not replace assistive-technology testing.

## 2. Colour tokens

CSS variables are mapped through Tailwind CSS v4 `@theme inline` (for example `bg-canvas`, `text-ink`, `bg-brand`, `border-control-border`). Light and dark themes are both first-class.

### Neutrals and controls

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F8FAFC` | `#0B1120` | Main page background |
| `surface` | `#FFFFFF` | `#101A2C` | Cards, panels and menus |
| `surface-2` | `#F1F5F9` | `#16233B` | Wells, hover surfaces and muted panels |
| `line` | `#E2E8F0` | `#24344D` | Subtle dividers and card structure |
| `field` | `#EEF2F7` | `#1B2942` | Input/select fill |
| `control-border` | `#64748B` | `#64748B` | Visible form-control boundaries (3:1+ against field/surface) |
| `ink` | `#0F172A` | `#E8EEF9` | Primary text |
| `ink-2` | `#334155` | `#B7C4D6` | Secondary text |
| `muted` | `#5D6B80` | `#8595A9` | Captions and tertiary text |

Use `line` for card edges and dividers. Use `control-border` for visible inputs; `field` is a fill, not a border colour.

### Brand

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` | `#2563EB` | `#2563EB` | Primary fills, active navigation and key actions |
| `brand-hover` | `#1D4ED8` | `#1D4ED8` | Hover state |
| `brand-soft` | `#E8EFFD` | `#14233F` | Selected surfaces and chips |
| `brand-text` | `#1D4ED8` | `#93C5FD` | Links and brand-coloured text |
| `brand-ring` | `#3B82F6` | `#60A5FA` | Keyboard focus ring |

The blue palette is the current shared product brand. Subject-specific icon tints may communicate Biology, Physics and Chemistry, but subject colour does not replace the primary brand.

### Accent and semantic states

| Token | Light | Dark | Use |
|---|---|---|---|
| `accent` / `accent-soft` | `#D97706` / `#FEF3C7` | `#F59E0B` / `#2A2008` | Highlights and accent icons |
| `accent-text` | `#9A4A07` | `#F59E0B` | Text on accent-soft |
| `good` / `good-soft` | `#15803D` / `#DCFCE7` | `#4ADE80` / `#10281A` | Correct / success |
| `bad` / `bad-soft` | `#B91C1C` / `#FEE2E2` | `#F87171` / `#2D1414` | Incorrect / error |

### Elevation

| Token | Use |
|---|---|
| `shadow-card` | Cards at rest; subtle |
| `shadow-window` | Menus and floating panels |

Prefer borders and spacing for structure; avoid heavy shadows on ordinary content cards.

## 3. Typography

- **UI and content:** Inter Variable, self-hosted with Fontsource.
- **Fallbacks:** system UI, Segoe UI, Roboto and Indic-script fallbacks are declared in `--font-sans`.
- **Features:** `cv11` and `ss01`; use tabular numerals for counts and timers.

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display (hero H1) | 40 → 60 px / 1.05 | 600 | -0.02em |
| H2 (section) | 30 → 36 px / 1.2 | 600 | -0.015em |
| H3 (card) | 16–18 px / 1.4 | 600 | normal |
| Lede | 18–20 px / 1.7 | 400 | normal |
| Body | 15–16 px / 1.6–1.75 | 400 | normal |
| Small / caption | 12–14 px / 1.5 | 400–500 | normal |
| Question stem | 14–16 px / 1.6–1.7 | 500 | normal |

Use `text-balance` for headings and `text-pretty` for explanatory paragraphs. Keep long reading lines near 65–75 characters where practical.

## 4. Spacing, layout and shape

- **4 px base grid.** Common steps: 4, 8, 12, 16, 20, 24, 32, 48, 64 and 96.
- **Container:** max 72rem (`max-w-6xl`), side padding 20 px on mobile / 32 px from 640 px.
- **Landing-section rhythm:** 80 px mobile / 112 px from 640 px.
- **Radius:** 8 px controls/chips · 12 px small cards · 16 px cards · 24 px larger panels · full radius for pills/buttons.
- **Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`. The Study two-pane layout starts at `lg`.

## 5. Motion

- Short, functional transitions: 150–200 ms for colour/opacity/transform.
- No parallax, bouncing or auto-playing decorative animation.
- Respect `prefers-reduced-motion`; PDF loading shimmer and smooth scrolling are reduced as appropriate.
- Feedback is direct and uses semantic colour plus text/symbols.

## 6. Shipped shared components

| Component | File | Notes |
|---|---|---|
| `Button` / `ButtonLink` | `src/components/ui/button.tsx` | primary / secondary / ghost; md / lg |
| `Container` | `src/components/ui/container.tsx` | max-width and page gutters |
| `Section` | `src/components/ui/section.tsx` | labelled marketing section |
| `Logo` / `LogoMark` | `src/components/logo.tsx` | uses `--brand` |
| `ThemeToggle` | `src/components/theme-toggle.tsx` | system theme plus user override |
| `AppShell` | `src/components/app/app-shell.tsx` | responsive sidebar/drawer; Escape, focus containment/restoration and scroll lock |
| `PdfViewer` | `src/components/viewer/pdf-viewer.tsx` | custom PDF.js viewer with loading, error and retry states |
| `QuestionCard` | `src/features/study/question-card.tsx` | option keyboard interaction and text feedback |

Use native inputs/selects with visible labels and the shared colour/focus tokens. Do not create a second palette in feature-level CSS.

## 7. Accessibility baseline

- **Text contrast:** 4.5:1 for normal text; 3:1 for large text.
- **Non-text UI contrast:** 3:1 for controls and focus indicators where required to identify the component/state.
- **Machine-checked:** `python3 scripts/check-contrast.py` evaluates 45 shipped token combinations in light and dark themes. CI runs this through `npm run check:contrast`.
- **Focus:** visible 2 px `brand-ring` outline with 3 px offset.
- **Touch targets:** aim for at least 40 px; primary actions are 48 px where practical.
- **Landmarks:** skip link, header, navigation and main content; use a clear heading hierarchy.
- **State:** never rely on colour alone. Question progress includes visible symbols and accessible names.
- **Forms:** visible labels, semantic error/success announcements and higher-contrast control boundaries.
- **Mobile navigation:** Escape closes the drawer; Tab/Shift+Tab stay inside it; focus returns to the trigger; background scrolling is locked while open.
- **Reduced motion:** honour user preferences.

The token checker is not a complete WCAG audit of every text/background combination in every rendered screen. Keyboard, screen-reader and real-device testing remain separate QA activities.

## 8. Dark mode

- `next-themes`, class strategy, default `system`, user override remembered.
- Native `color-scheme` follows the selected theme.
- Dark surfaces are deep slate-blue, not pure black; brand text and semantic states are lightened for legibility.
- Browser theme-colour metadata uses the actual canvas values.

## 9. Internationalisation readiness

- UI copy remains English-first; Hindi and Bengali are planned, not claimed as shipped.
- Keep content flexible for text expansion and locale-aware dates/numbers.
- Urdu requires a deliberate RTL layout pass before support is claimed.

## 10. Changelog

- **2026-11-02 · Theme reconciliation.** Replaced obsolete emerald/warm-neutral palette values with the shipped slate/blue tokens; clarified that `field` is an input fill and `control-border` is its visible boundary.
- **2026-11-02 · Accessibility closeout.** Added a stronger control-border token for profile/settings and printed-page inputs; expanded contrast coverage to 45 combinations. Mobile navigation now handles Escape, focus containment/restoration and background scroll locking. Question progress markers now show symbols and can navigate questions; the mobile panel switcher uses a pressed-button group rather than incomplete tab roles. Progress table supports horizontal scrolling on narrow screens.
- **2026-11-02 · Brand assets.** Synced favicon, Open Graph artwork and browser theme-colour metadata with the shipped blue theme.
