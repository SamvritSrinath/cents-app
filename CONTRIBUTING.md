# Contributing

Thanks for helping improve Cents.

## Getting started

1. Fork and clone the repository.
2. Use Node.js 20.x and run `npm ci`.
3. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key (see [docs/02-setup.md](docs/02-setup.md)).

## Workflow

- Open a pull request against `main` or `develop`.
- Keep changes focused; match existing patterns for hooks, theming, and Supabase usage.
- Run locally before pushing:

  ```bash
  npm run format:check
  npm run lint
  npm run typecheck
  npm run test:ci
  npm run verify-ci-docs
  npm run verify-api-docs
  npx expo-doctor
  ```

- If you edit [`.github/workflows/ci.yml`](.github/workflows/ci.yml), run `npm run generate-ci-docs` and commit the updated [docs/generated/ci-pipeline.md](docs/generated/ci-pipeline.md).
- If you change modules covered by TypeDoc ([`typedoc.json`](typedoc.json)), run `npm run docs:api` and commit files under [docs/generated/api-md](docs/generated/api-md).

## Code style

- TypeScript strict mode is on; avoid `any` without a strong reason.
- Prefer hooks and small libraries under `lib/` for reusable logic.
- Do not commit secrets or service role keys.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
