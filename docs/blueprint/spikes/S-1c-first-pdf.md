# Spike S-1c (partial) · First real chapter PDF

**Date:** 2026-10-25 · **File:** Class 11 Biology, Ch. 6 *Anatomy of Flowering Plants* (Reprint 2025-26), 1.4 MB, supplied by owner. The PDF itself is **not** in git.

## Results

| Check | Result |
|---|---|
| Pages / encryption | 8 pages, not encrypted |
| Text layer | Present on all pages (776–2,719 chars/page); selectable and searchable |
| PDF index vs printed page | PDF 1–8 = printed **71–78**, offset 70, no cover/blank pages (chapter-wise file) |
| Auto-extraction of printed numbers (header text) | **8/8 correct** |
| Page size | 612 × 821 pt, uniform |
| Origin | Document metadata shows NCERT's own production (PageMaker 7.0, `ch-6.pmd`, Ghostscript, modified 2025-04-30); no third-party app metadata |
| Watermark | "© NCERT not to be republished" is baked into page graphics |
| Text-extraction quality | Needs cleaning: hyphen-joined words ("singlelayered"), column order mix on pages with figures (72, 75) |

## Risks found

1. **Heavy figure pages:** PDF pages 3 (printed 73) and 6 (printed 76) contain 3,426 and 2,307 image objects (figures built from fragments). PDF.js may render these slowly on phones. Action in S-1a: measure render time and memory on a mid-range Android; consider downscaling or caching rendered canvases and prefetching these pages.
2. **Text order on figure pages** affects question generation; the pipeline must clean text and optionally let the model see the page image.
3. **Source provenance:** file reached the owner through a third-party app. Permission (docs/legal/ncert-permission.md) must cover the NCERT file itself; preferred source for production uploads is NCERT's own download.

## Mapping proposal for this chapter

`chapter 6: pdf 1→71 (opener), 2→72 … 8→78 (exercises)`; page 78 `kind=exercise`, page 77 contains summary, page 71 `kind=content` (chapter opener with intro text). Checked automatically; still needs the human verify step in the admin screen.

## Next

Browser-side S-1a/S-1b (render performance, detection accuracy) once the viewer prototype exists.
