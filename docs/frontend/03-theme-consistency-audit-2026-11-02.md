# Day 6 — Theme and brand consistency audit

**Date:** 2026-11-02  
**Audited base:** Day 5 head `dcb7790896afe89eb384b110801b0ffbbdf9a3fc`  
**Working branch:** `audit/ui-theme-consistency-day-6`

## Scope and approach

Reviewed the shipped theme tokens, root metadata, favicon, social preview image, theme toggle, app shell, shared UI primitives, onboarding illustration, PDF viewer styling, and the existing contrast checker. The shipped CSS in `src/app/globals.css` was treated as the current implementation source of truth. Older design documents were not assumed to describe the current app.

## Findings

| Area | Finding | Action |
|---|---|---|
| Browser chrome | `themeColor` still used the previous green-tinted page backgrounds (`#fafaf7`, `#0c1210`), while the shipped CSS uses `#f8fafc` and `#0b1120`. | Synchronized both media-specific colors with the actual light/dark canvas tokens. |
| Favicon | Static favicon still used the previous emerald brand (`#148062`), while the live logo token is blue (`#2563eb`). | Updated favicon mark to the shipped brand color. |
| Social preview | Open Graph image retained the previous emerald palette and old neutral backgrounds/text. | Synchronized its light background, foreground, brand mark, accent heading, and footer text with the shipped light palette. |
| Onboarding success illustration | A white checkmark sat on `var(--good)`. In dark mode this is white on `#4ade80`, only **1.74:1** contrast. | Changed the circle to `var(--good-soft)` and the check stroke to `var(--good)`: **8.99:1** in dark mode and **4.57:1** in light mode. |
| Contrast guard | The checker covered **35** pairs, did not test dark semantic status text on canvas/surface or input text on fields, used the older 0.03928 transfer threshold, and was not run by CI. | Expanded it to **41** pairs, updated the sRGB threshold to 0.04045, added `npm run check:contrast`, and wired the command into CI. |

## Current implementation tokens

The values below are read from `src/app/globals.css` and are documented here as an audit snapshot, not a newly approved redesign.

| Token | Light | Dark |
|---|---|---|
| Canvas | `#f8fafc` | `#0b1120` |
| Surface | `#ffffff` | `#101a2c` |
| Surface 2 | `#f1f5f9` | `#16233b` |
| Field | `#eef2f7` | `#1b2942` |
| Primary text | `#0f172a` | `#e8eef9` |
| Secondary text | `#334155` | `#b7c4d6` |
| Muted text | `#5d6b80` | `#8595a9` |
| Brand | `#2563eb` | `#2563eb` |
| Brand text | `#1d4ed8` | `#93c5fd` |
| Good | `#15803d` | `#4ade80` |
| Bad | `#b91c1c` | `#f87171` |

## Documentation discrepancy and closeout resolution

At the time of the Day 6 audit, `docs/frontend/01-design-foundations.md` still documented an emerald primary brand and older light/dark neutral values. The final closeout branch subsequently reconciled that document with the shipped slate/blue palette and clarified the distinction between `field` fills, decorative `line` borders and `control-border` boundaries.

The final closeout also extended the contrast guard to 45 pairs and added the four input-control boundary combinations. See `docs/frontend/04-ui-closeout-2026-11-02.md` for the full final change record.

The PDF viewer's white paper surface and its dark-mode PDF filter are document-rendering behavior, not an app-wide surface token. Official Google marks and the PDF badge's red color are also intentional third-party/content colors, not theme-token drift.

## Verification

- Parsed all 41 configured contrast pairs against the values in the checker: **41/41 pass**.
- Verified the onboarding success icon's old and new light/dark contrast values.
- Source-level inspection completed for the files listed above.
- GitHub CI and the Vercel preview will provide build verification for this branch.
- **No browser/device visual QA or screen-reader QA has been performed.** The report does not claim those checks.

