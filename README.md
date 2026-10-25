# PageWise

> Read the page. Practise the page.

A web app for NEET aspirants that puts an **NCERT page** and **exam-style practice questions from that exact page** side by side. Biology first, English first, laptop/desktop first. More languages, phone-first UX, Physics and Chemistry follow.

> **PageWise is a placeholder name.** It lives in one file (`src/config/brand.ts`). Change it there and in `docs/` when the real name is chosen.

## Status

| Step | What | State |
|---|---|---|
| 1 | Landing page (this repo) | Done |
| 2 | App shell + auth | Next |
| 3 | Study workspace (split view) | Planned |
| 4 | Content pipeline + reviewer console | Planned |

See [`docs/README.md`](docs/README.md) for the full plan and build log.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build && npm start
```

Requires Node 20+ (developed on Node 22).

## Environment variables

Copy `.env.example` to `.env.local`. All are optional for the landing page.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_WAITLIST_URL` | Google Apps Script web-app URL that stores waitlist signups. Without it the form is shown disabled. Setup: [`docs/ops/02-waitlist-apps-script.md`](docs/ops/02-waitlist-apps-script.md) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata / Open Graph. On Vercel it falls back to the production domain automatically. |

## Deploy (Vercel)

Import the repo in Vercel, keep the defaults (Framework: Next.js), add the env vars above, deploy. Details and caveats: [`docs/ops/01-deploy-vercel.md`](docs/ops/01-deploy-vercel.md).

## Quality checks

```bash
npm run lint
npm run build
python3 scripts/check-contrast.py   # WCAG contrast for every colour token pair, both themes
```

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · lucide-react · next-themes · Inter (self-hosted via Fontsource). Backend (next step): Supabase. See [`docs/architecture/01-tech-stack.md`](docs/architecture/01-tech-stack.md).

## Project structure

```
src/
  app/                 routes, layout, metadata, OG image, icon
  components/
    ui/                design-system primitives (Button, Container, Section)
    landing/           landing-page sections
  config/brand.ts      brand name, tagline, nav, env-driven config
  lib/                 small utilities
docs/                  product, frontend, architecture, ops documentation
```

## Important notes for contributors (human or AI)

- This Next.js version differs from older ones. Read `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs/` before writing framework code.
- Never commit secrets. `.env*` files are git-ignored except `.env.example`.
- Do not host or copy NCERT book content. See [`docs/product/03-content-and-legal-guardrails.md`](docs/product/03-content-and-legal-guardrails.md).
