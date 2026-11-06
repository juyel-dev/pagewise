# PageWise

> Read the page. Practise the page.

A web app for NEET aspirants that puts an **NCERT page** and **exam-style practice questions from that exact page** side by side. Biology first, English first, laptop/desktop first. More languages, phone-first UX, Physics and Chemistry follow.

> **PageWise is a placeholder name.** It lives in one file (`apps/web/src/config/brand.ts`). Change it there and in `docs/` when the real name is chosen.

## Status

| Step | What | State |
|---|---|---|
| 1 | Landing page (this repo) | Done |
| 2 | App shell + auth (Google + magic link) | Done |
| 3 | Study workspace (split view, own PDF viewer) | Done — first cut |
| 4 | Content pipeline + reviewer console (in-app) | Done — first cut |
| 5 | Guest mode + Google-only auth | In progress |
| 6 | Full-MVP build (remaining screens, separate admin app) | Next |
| 7 | Polish pass (UX, copy, performance, errors) | After step 6 |

See [`docs/README.md`](docs/README.md) for the full plan and build log.

## Run locally

```bash
npm install                 # installs every workspace
npm run dev                 # student app, http://localhost:3000
npm run typecheck && npm run lint && npm test
npm run build
```

Requires Node 20+ (developed on Node 22).

## Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local`. All are optional for the landing page.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_WAITLIST_URL` | Google Apps Script web-app URL that stores waitlist signups. Without it the form is shown disabled. Setup: [`docs/ops/02-waitlist-apps-script.md`](docs/ops/02-waitlist-apps-script.md) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata / Open Graph. On Vercel it falls back to the production domain automatically. |

## Deploy (Vercel)

Import the repo in Vercel, set **Root Directory = `apps/web`** (Framework: Next.js), add the env vars above, deploy. Details and caveats: [`docs/ops/01-deploy-vercel.md`](docs/ops/01-deploy-vercel.md).

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check:contrast   # WCAG contrast for every colour token pair, both themes
```

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · lucide-react · next-themes · Inter (self-hosted via Fontsource). Backend (next step): Supabase. See [`docs/architecture/01-tech-stack.md`](docs/architecture/01-tech-stack.md).

## Project structure

```
apps/web/              student app (Next.js). Admin app arrives as apps/admin (decision 39)
  src/app/             routes only
  src/features/<x>/    one module per feature (public surface = index.ts)
  src/config/          registries: nav, home sections, brand
  src/lib/             infrastructure (supabase, local store, auth)
  src/components/ui/   design-system primitives
packages/question-schema/   question format, validation, grading (shared, pure TS)
supabase/              migrations (single source of truth)
docs/                  product, architecture, ops. Start with blueprint/14
```

Boundary rules are enforced by ESLint: `lib` and `ui` never import `features`; features import other features only through `index.ts`.
