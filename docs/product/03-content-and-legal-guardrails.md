# 03 · Content and legal guardrails

> This is an engineering/product document, not legal advice. Have a lawyer review before public launch.

> **Update 2026-10-25 (decision D-15):** the owner chose an own PDF.js viewer with authorized NCERT PDFs and is obtaining permission himself. Rules below about hosting/proxying apply **unless** `docs/legal/ncert-permission.md` records permission covering hosting and display. See `docs/blueprint/09-pdf-viewer-spec.md` §8.

## 1. NCERT content: the "official link" approach

**Principle:** the NCERT book is NCERT's property. We never host, copy, mirror or republish it. We show students NCERT's own official PDF and add *our own* original practice questions beside it.

### What is safe by design

- Original questions, options, answers and explanations written by us (AI-assisted, human-reviewed).
- Links/embeds pointing at NCERT's official URLs.
- Page numbers and chapter names as references.

### What we avoid

- Storing NCERT PDFs or page images on our servers/CDN.
- Storing or publishing NCERT's full text. During offline generation the text is read in memory (or a private working folder) and **not** committed or published.
- Quoting long NCERT passages in questions or explanations. Short factual references are fine; reproduce nothing verbatim at length.
- Proxying NCERT PDFs through our own backend (that is hosting in effect).

### Feasibility test (must run before building the workspace)

Embedding an official PDF is a technical question, not only a legal one. Test on real devices:

| Test | Pass condition |
|---|---|
| Iframe embed of the official PDF URL loads | No `X-Frame-Options` / CSP frame-ancestors block |
| `#page=N` opens the right page | Works in Chrome, Edge, Firefox, Safari on desktop |
| Mobile browsers | Android Chrome and iOS Safari generally do **not** render PDFs inline → needs fallback |
| pdf.js fetching the official URL cross-origin | Needs CORS headers from NCERT; likely blocked |

**Outcome plan**

1. If iframe + `#page=N` works on desktop → use it (desktop-first launch).
2. Else, or on phones → **"Open NCERT page N"** button that opens the official PDF in a new tab/side window; the workspace stays question-first.
3. Optional power feature: user-uploaded PDF kept only in their own browser (never uploaded).

Because the embed cannot be controlled, we promise *page jump*, not *line highlight*.

### Copyright hygiene checklist (pre-launch)

- [ ] Lawyer reviews the approach and the footer disclaimer.
- [ ] Consider writing to NCERT for permission/acknowledgement (builds credibility).
- [ ] No NCERT/NTA logos or trademarks; no implication of endorsement.
- [ ] Brand name does not contain "NCERT" or "NEET".

## 2. Question quality pipeline

States: `draft → auto_checked → in_review → published → flagged → retired`.

1. **Generate** offline from the page, in batches, with a strict schema (type, stem, options, answer, explanation, difficulty, source page, tags).
2. **Auto-check**: a second pass verifies the answer is supported by the page text; failures are routed to review, never published.
3. **Human review**: medical students approve / edit / reject in the reviewer console. Sampling plus 100% review of auto-check failures.
4. **Publish** to versioned static data; every question keeps an immutable version history.
5. **Report loop**: user reports increment a counter; above a threshold the question is auto-hidden and re-queued.

Rules for every question: must be answerable from the cited page; exactly one defensible correct option; no ambiguous "all/none of the above" tricks without justification; explanations short and factual.

## 3. Privacy and children's data

- Many NEET aspirants are under 18. India's **DPDP Act 2023** requires verifiable parental consent for processing children's personal data and restricts tracking/targeted advertising to children. Design for this from day one.
- **Data minimisation:** collect only what is needed (email, display name, target year, language, progress).
- **No ads and no behavioural tracking of minors.** Analytics must be privacy-safe and aggregated.
- Provide data export and deletion on request.
- Waitlist (landing page): only email + target-year option; used only to announce launch.
- Pre-launch tasks: privacy policy, terms, consent flow for under-18, grievance contact.

## 4. Claims policy (marketing copy)

- No invented statistics, testimonials, rankings or "trusted by N students".
- Process claims on the landing page (e.g. "reviewed by medical students") must be **true at launch**. Update copy if the process changes.
- Always keep the disclaimer: independent project, not affiliated with NCERT or NTA; practice aid, not a replacement for the textbook.
