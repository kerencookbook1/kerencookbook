# Codex Instructions - Recipe Web App

## Start here

1. Read this file first.
2. Check whether the `ui-ux-pro-max` skill is installed. If it is missing, run:

```bash
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
```

3. Verify that the skill is available before any UI implementation and use it for the Design System, responsive layouts, RTL and accessibility work.
4. Read only `## 18. מצב נוכחי והצעד הבא` and the active rows in `## 12. Backlog ומעקב` from `PROJECT.md`.
5. Open `recipe-app-full-spec-he.md` only for the feature being implemented. Use `rg` to locate the relevant section; do not load the whole file unless architecture changes.
6. Before editing, state the plan, affected files, dependencies and tests.

## Product

- Responsive Hebrew RTL recipe Web App for phone and tablet; desktop is supported.
- Next.js App Router + React + TypeScript, hosted on Vercel.
- Supabase is the source of truth for Auth, PostgreSQL, Storage, Realtime and RLS.
- PWA with local drafts/cache in IndexedDB/Dexie.
- Imported/OCR content is always a draft until user review and approval.
- Preserve the original recipe separately from the user's edited version.

## Engineering rules

- Server Components by default; Client Components only for browser interaction.
- UI components never call Supabase directly. Use typed repositories/services.
- Validate external input with Zod on the server.
- Secrets stay server-side. Never expose service-role or AI keys with `NEXT_PUBLIC_`.
- Enable and test RLS for every exposed table.
- Database changes use new migrations only.
- Long OCR/AI work runs as an asynchronous job, not an open browser request.
- Use responsive layout by viewport/container, not user-agent detection.
- Every interactive control must work without hover and support keyboard/focus-visible.
- Preserve user changes and do not perform destructive Git or database actions without explicit approval.

## Parallel agents

- Use parallel agents only for independent tasks with non-overlapping file ownership.
- Domains: responsive UI, Web/PWA, Supabase, import/AI, search/sync, QA/security, integration.
- Shared files (`package.json`, root layout, configs, contracts, `PROJECT.md`) belong to the integration/orchestrator task.
- Each agent reports changed files, tests, results and blockers.
- A second agent reviews material changes before integration.

## Required verification

Run the smallest relevant checks during work and the full gate before merge:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
npm run project:check
```

- Test phone and tablet viewports in Playwright.
- Test RTL, keyboard, accessibility, loading, empty, error, offline and session-expired states.
- Test RLS with at least two users and all relevant roles.
- Do not mark a task complete without recording the exact test result.

## Documentation updates

- Only the orchestrator/integration owner updates `PROJECT.md`.
- Update current status, next action, backlog result, decisions and blockers after verified work.
- Use `README.md` for setup instructions.
- Keep detailed requirements in `recipe-app-full-spec-he.md`.
- Never store secrets, tokens, passwords or personal data in Markdown or Git.

## Completion standard

- No known critical/high defects.
- All approved critical flows pass.
- RLS and production build pass.
- Preview is checked on phone and tablet.
- `PROJECT.md` reflects the real state and next step.
