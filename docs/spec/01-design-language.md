# 01 · Design language

Tokens (colours, type roles, radii, base spacing, breakpoints, motion timing) are defined in `docs/frontend/01-design-foundations.md` §2–5. This file adds the rules that make screens feel consistent and calm.

## 1. Feel (the test every screen must pass)

1. **Calm and focused.** Few things per screen; whitespace around reading and questions; chrome is quiet.
2. **One primary action.** Exactly one `primary` Button per view region. Everything else is `secondary` or `ghost`.
3. **Real content, real data.** No placeholder numbers or fake lists (decision 13).
4. **Immediate feedback.** Every press changes something visible within 100 ms (pressed state, optimistic update, or skeleton).
5. **Nothing jumps.** Reserve space for images, PDFs and async blocks; loading skeletons match final layout.

## 2. Layout recipes

| Recipe | Use | Rule |
|---|---|---|
| **Page (centred)** | Home, Study hub, Progress, Bookmarks, Settings, Practice | `Container` (max `6xl`, gutters 20 / 32 px), vertical rhythm 24 px between blocks, 32 px between sections |
| **Workspace (full-bleed)** | Study workspace | Fills viewport below the 56 px app header: `height: calc(100dvh - 56px)`; no page scroll, inner panes scroll |
| **Card grid** | Chapter cards, stat tiles | CSS grid, gap 16; columns 1 (<640) · 2 (≥640) · 3 (≥1024); equal heights |
| **Form (narrow)** | Settings, onboarding | Max 640 px, labels above fields, 16 px between fields |
| **Auth (centred card)** | Sign-in | Card 420 px max, vertically centred |

Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Two-pane Study layout begins at `lg`; below that it is tabbed.

## 3. Density and sizing

- Touch targets ≥ 44 × 44 px on touch devices; ≥ 36 px height for desktop buttons (`md` = 40 px, `lg` = 48 px).
- Body 15–16 px; question stem 16 px / 1.65; captions 12–13 px; never below 12 px.
- Reading line length 65–75 characters for explanations and legal text.
- Icon size 16 px inline with text, 20 px in buttons, 24 px in navigation. Icons are `lucide-react`, stroke 1.75, `currentColor`; every icon-only control has an `aria-label`.

## 4. Elevation and layers

| Layer | z-index | Examples |
|---|---|---|
| Base | 0 | Page content |
| Sticky bars | 20 | Workspace toolbar, mobile bottom action bar |
| Popovers, menus | 30 | "More" menu, tooltips |
| Drawer / sheet | 40 | Mobile nav drawer, bottom sheet |
| Dialog + backdrop | 50 | Modals, command menu |
| Toast | 60 | Notifications |

Shadows: `shadow-card` only on cards that must lift from `canvas`; `shadow-window` on popovers and dialogs. Structure comes from borders (`line`) and spacing.

## 5. Motion

150–200 ms ease-out for colour, opacity, transform; sheets/dialogs 200 ms; skeleton shimmer 1.4 s linear loop. All motion disabled under `prefers-reduced-motion` (replace with instant state change). No animation longer than 300 ms; no decorative loops.

## 6. State colour semantics

| Meaning | Token pair | Always with |
|---|---|---|
| Selected / current | `brand-soft` bg + `brand-text` | border `brand` |
| Correct / success | `good-soft` + `good` | ✓ symbol and the word "Correct" |
| Incorrect / error | `bad-soft` + `bad` | ✗ symbol and text |
| Draft / warning / staff | `accent-soft` + `accent-text` | label text |
| Disabled | 50 % opacity, `cursor-not-allowed` | `aria-disabled` or `disabled` |

Colour is never the only signal (WCAG 1.4.1).

## 7. Focus

Every interactive element shows a 2 px `brand-ring` outline with 2 px offset on `:focus-visible`. Never remove outlines. Focus order follows visual order; dialogs trap focus and restore it on close.

## 8. Imagery and illustration

No stock photos. Chapter cards use a tinted block per subject (Biology = green tint, Physics = blue tint, Chemistry = amber tint, from existing semantic tokens) with the chapter number. Empty states use a simple line icon, a title, one sentence and one action.

## 9. Voice and copy

Plain, short, kind. Address the student as "you". No exclamation marks except celebratory completion. Errors say what happened and what to do next. Shared strings: `05-copy-and-states.md` (to be written); until it exists, copy is specified in each screen spec.

## 10. Theming

Light and dark are both first-class; every screen is verified in both. Components use tokens only; a hard-coded hex colour in feature code is a defect. `scripts/check-contrast.py` must pass.
