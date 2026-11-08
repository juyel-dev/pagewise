<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Pagewise workflow (read before changing anything)

- Start with `docs/dev/README.md` and `docs/dev/conventions.md`; pick work from `docs/status.md`.
- Build only from `docs/walkthrough/` (how it looks) and `docs/spec/` (behaviour, tests). If something is missing, add it to the spec's open questions and ask the owner; never decide it in code.
- Never commit secrets. If a token appears in the conversation, tell the owner to revoke it.

