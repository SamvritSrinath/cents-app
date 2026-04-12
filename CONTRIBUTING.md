# Contributing

Thanks for helping improve Cents.

## Getting started

1. Fork and clone the repository.
2. Use Node.js 20.x and run `npm ci`.
3. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key (see [docs/guide/getting-started.md](docs/guide/getting-started.md)).

## Workflow

- Open a pull request against `main` or `develop`.
- Keep changes focused; match existing patterns for hooks, theming, and Supabase usage.
- Run locally before pushing:

  ```bash
  npm run format:check
  npm run lint
  npm run typecheck
  npm run verify-ci-docs
  npm run verify-api-docs
  npm run test:ci
  npx expo-doctor
  npm run test:e2e:ci
  ```

- Preview the docs site: `npm run docs:dev` (open the URL VitePress prints, usually under `http://localhost:5173/cents-app/`).

- If you edit [`.github/workflows/ci.yml`](.github/workflows/ci.yml), run `npm run generate-ci-docs` and commit the updated [docs/generated/ci-pipeline.md](docs/generated/ci-pipeline.md).
- If you change modules covered by TypeDoc ([`typedoc.json`](typedoc.json)), run `npm run docs:api` and commit files under [docs/generated/api-md](docs/generated/api-md).
- If you change the **documentation site** (VitePress config or pages under `docs/`), run `npm run docs:build` locally to confirm it succeeds before merging.

## Documentation

- **Guides** live in [`docs/guide/`](docs/guide/) (published to GitHub Pages from `main`).
- **Public APIs** in `lib/` and `hooks/` should include thorough **TSDoc** (`/** ... */`): module-level `@remarks` for RLS/cache/env, `@param` / `@returns` / `@throws` when not obvious from types alone. TypeDoc emits committed Markdown (`docs/generated/api-md/`) and HTML on the docs site at [`/api/`](https://samvritsrinath.github.io/cents-app/api/index.html). Avoid unknown block tags (e.g. `@owner`) that TypeDoc warns on.
- Preview the site: `npm run docs:dev` (opens VitePress with hot reload).

## Code style

- TypeScript strict mode is on; avoid `any` without a strong reason.
- Prefer hooks and small libraries under `lib/` for reusable logic.
- Do not commit secrets or service role keys.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
