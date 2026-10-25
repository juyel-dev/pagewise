# Frontend · 01 · Design foundations

The rules every screen follows. Tokens live in `src/app/globals.css`; change a token and the whole app follows.

## 1. Design principles

1. **Calm over loud.** Long study sessions; neutral surfaces, one brand colour, restrained motion.
2. **Content is the hero.** The NCERT page and the question get the space; chrome stays thin.
3. **Clarity of state.** Correct/wrong/selected/disabled are never colour-only (icon + text too).
4. **Keyboard-first on desktop, thumb-first on phone.**
5. **Consistent, boring components.** Reuse before inventing.
6. **Accessible by default.** WCAG 2.2 AA is the floor.

## 2. Colour

Defined as CSS variables, mapped to Tailwind via `@theme inline` (`bg-canvas`, `text-ink`, `bg-brand`, …). Light and dark are both first-class.

### Neutrals

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#FAFAF7` | `#0C1210` | Page background |
| `surface` | `#FFFFFF` | `#121A17` | Cards, panels |
| `surface-2` | `#F2F4EE` | `#17211D` | Wells, headers, hover |
| `line` | `#E2E6DE` | `#24332D` | Decorative dividers and card edges only (too faint for control borders) |
| `field` | `#78877F` | `#62786E` | Borders of inputs and controls (3:1 or more on surfaces) |
| `ink` | `#12201A` | `#E8EFEB` | Primary text |
| `ink-2` | `#3B4A43` | `#B9C8C0` | Secondary text |
| `muted` | `#62736A` | `#8DA198` | Tertiary, captions (≥4.5:1 on canvas) |

### Brand (emerald, Biology)

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` | `#148062` | `#148062` | Fills: primary buttons (white text 4.9:1) |
| `brand-hover` | `#116750` | `#117155` | Hover. Darker in both themes so white text stays above 4.5:1 |
| `brand-soft` | `#E6F5EE` | `#12261F` | Tinted backgrounds, chips |
| `brand-text` | `#116750` | `#6BCBA9` | Brand-coloured text/links |
| `brand-ring` | `#1F9C77` | `#3DB48D` | Focus ring, dots |

**Swapping the primary colour:** edit the five `--brand*` variables (light and dark). Nothing else changes.

### Accent and semantic

| Token | Light | Dark | Use |
|---|---|---|---|
| `accent` / `accent-soft` | `#D97706` / `#FEF3C7` | `#F59E0B` / `#2A2008` | Streak, highlights. `accent` itself is for icons only |
| `accent-text` | `#9A4A07` | `#F59E0B` | Text on `accent-soft` (5.6:1 in light) |
| `good` / `good-soft` | `#15803D` / `#DCFCE7` | `#4ADE80` / `#10281A` | Correct |
| `bad` / `bad-soft` | `#B91C1C` / `#FEE2E2` | `#F87171` / `#2D1414` | Wrong, errors |

**Subject colours (future):** Biology = emerald (now). Chemistry = violet, Physics = blue. Each subject re-maps `--brand*`.

## 3. Typography

- **UI + content:** Inter Variable (self-hosted via Fontsource; no external requests).
- **Indic scripts (later):** Noto Sans Devanagari, Bengali, Tamil, Telugu, etc., added per language as self-hosted fonts; fallbacks already listed in `--font-sans`. Urdu needs RTL layout support (`dir="rtl"`).
- Features: `cv11`, `ss01` enabled; `tabular-nums` for counters and timers.

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display (hero H1) | 40 → 60 px / 1.05 | 600 | -0.02em |
| H2 (section) | 30 → 36 px / 1.2 | 600 | -0.015em |
| H3 (card) | 16–18 px / 1.4 | 600 | normal |
| Lede | 18–20 px / 1.7 | 400 | normal |
| Body | 15–16 px / 1.6–1.75 | 400 | normal |
| Small / caption | 12–14 px / 1.5 | 400–500 | normal |
| Question stem (workspace) | 16–17 px / 1.65 | 500 | normal |

Rules: max line length ~65–75 characters; use `text-balance` for headings and `text-pretty` for paragraphs; never use ALL-CAPS for more than a short eyebrow.

## 4. Spacing, layout, shape

- **4 px base grid.** Common steps: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
- **Container:** max 72rem (`max-w-6xl`), side padding 20 px (mobile) / 32 px (≥640 px).
- **Section rhythm (marketing):** 80 px (mobile) / 112 px (≥640 px) vertical padding.
- **Radius:** 8 px inputs/chips · 12 px small cards · 16 px cards · 24 px hero panels · full for pills/buttons.
- **Breakpoints (Tailwind):** `sm 640` · `md 768` · `lg 1024` · `xl 1280`. The workspace's two-pane layout starts at `lg`.

## 5. Elevation

| Token | Use |
|---|---|
| `shadow-card` | Cards at rest; barely there |
| `shadow-window` | Hero preview, key panels |
| Borders first | Prefer a 1 px `line` border over shadows for structure |

## 6. Motion

- Short and functional: 150–200 ms colour/opacity/transform; ease-out.
- No parallax, no auto-playing animation, no bouncing.
- `prefers-reduced-motion`: smooth-scroll disabled; non-essential animation removed.
- Feedback (correct/wrong) uses a brief colour + icon change, never a celebratory popup.

## 7. Iconography

- **lucide-react**, 16/18/20 px, stroke 1.75–2, inherit `currentColor`.
- Decorative icons `aria-hidden`; icon-only buttons always have an `aria-label`.

## 8. Core components (shipped)

| Component | File | Notes |
|---|---|---|
| `Button` / `ButtonLink` | `components/ui/button.tsx` | variants `primary / secondary / ghost`, sizes `md / lg`; min height 40/48 px |
| `Container` | `components/ui/container.tsx` | width + gutters |
| `Section` | `components/ui/section.tsx` | eyebrow → H2 → lede → content; labelled region |
| `Logo` / `LogoMark` | `components/logo.tsx` | Mark uses `--brand` |
| `ThemeToggle` | `components/theme-toggle.tsx` | CSS-swapped icons, no hydration flicker |

**Planned for the app shell and workspace** (specified in their screen docs): `Input`, `Select`, `Checkbox`, `Tabs`, `Dialog`, `Tooltip`, `Toast`, `Skeleton`, `ProgressDots`, `QuestionCard`, `OptionRow`, `ModeToggle` (Focus/List), `SplitPane`, `Kbd`, `EmptyState`.

## 9. Accessibility baseline

- Contrast: text ≥ 4.5:1, large text and UI ≥ 3:1. **Machine-checked:** `python3 scripts/check-contrast.py` covers 41 token pairs in both themes and must pass before any token change is merged.
- Visible `:focus-visible` ring everywhere (2 px `brand-ring`, 3 px offset).
- Touch targets ≥ 40 px (48 px for primary CTAs).
- Landmarks: skip link, `header`, `nav`, `main`, `footer`; one `h1` per page; headings in order.
- State is never colour-only. Forms have visible labels; errors in `role="alert"`.
- Disclosures (FAQ) use native `<details>`; mobile menu uses `aria-expanded` + `aria-controls`, closes on Escape.
- Reduced-motion respected.

## 10. Dark mode

- `next-themes`, class strategy, default `system`, user override remembered.
- `color-scheme` set per theme so native controls match.
- Dark surfaces are warm-green-tinted near-black, not pure black; brand text lightens for contrast.

## 11. i18n readiness

- All user-facing copy will move to message catalogues (`next-intl`) in the app-shell step; the landing page is English-only for now.
- Never concatenate translated fragments; avoid text in images; allow ~40% text expansion; support RTL for Urdu; locale-aware numbers/dates.

## 12. Changelog

- **2026-10-25 · Contrast audit.** Checking the shipped tokens with `scripts/check-contrast.py` found three failures, now fixed: input borders were 1.26:1 (new `field` token, 3.8:1); dark-mode button hover with white text was 3.8:1 (now 6.0:1); light-mode streak chip text was 2.9:1 (new `accent-text`, 5.6:1).
