---
title: CI and local checks
description: What GitHub Actions runs, how to mirror it locally, and where generated docs live.
---

# CI and local checks

## Motivation

CI should be **predictable** and **cheap to reproduce** on a laptop. Jobs are **split** so lint, docs verification, and tests can run in parallel on GitHub, and a **bundle smoke** step runs after unit tests as a lightweight E2E-style gate ([`e2e/README.md`](https://github.com/SamvritSrinath/cents-app/blob/main/e2e/README.md)).

## Workflow

The mobile workflow lives at `.github/workflows/ci.yml`. It runs on:

- **push** to `main` and `develop`
- **pull_request** targeting `main`

### Jobs

| Job | Purpose |
| --- | --- |
| **`lint`** | `format:check`, `lint`, `typecheck` |
| **`docs-verify`** | Regenerate and verify `docs/generated/ci-pipeline.md` and `docs/generated/api-md` |
| **`unit-test`** | `test:ci`, `expo-doctor` |
| **`e2e-smoke`** | Runs **after** `unit-test` succeeds — `npm run test:e2e:ci` (Android `expo export` bundle smoke) |

**EAS builds are not part of CI.** Run EAS manually when you need binaries ([Release & EAS](./release.md)).

### Machine-readable pipeline

The file `docs/generated/ci-pipeline.md` is **generated** from the workflow YAML so it cannot drift:

```bash
npm run generate-ci-docs
```

Browse on GitHub: [`docs/generated/ci-pipeline.md`](https://github.com/SamvritSrinath/cents-app/blob/main/docs/generated/ci-pipeline.md).

### API reference (two outputs)

| Output | Command | Committed? | Purpose |
| --- | --- | --- | --- |
| Markdown | `npm run docs:api` | Yes (`docs/generated/api-md`) | PR-friendly diffs in GitHub |
| TypeDoc HTML | `npm run docs:api:html` | No (gitignored `public/api`) | Interactive API at **`/api/`** on the docs site; `docs:build` runs this automatically |

Public APIs should carry **TSDoc / JSDoc-style** comments; TypeDoc renders them.

## View documentation locally

From the repo root:

```bash
npm run docs:dev
```

VitePress prints a local URL (often `http://localhost:5173/cents-app/`). TypeDoc HTML is at **`/cents-app/api/`** (generated automatically on first `docs:dev` if missing). To preview a production build: `npm run docs:build` then `npm run docs:preview`.

## Mirror CI locally

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run verify-ci-docs
npm run verify-api-docs
npm run test:ci
npx expo-doctor
npm run test:e2e:ci
```

## Documentation site deploy

On **push to `main`** (or manual **workflow_dispatch**), `.github/workflows/docs.yml` runs `npm run docs:build` (TypeDoc HTML + VitePress), uploads `docs/.vitepress/dist` with `actions/upload-pages-artifact@v4`, and deploys with `actions/deploy-pages@v4`.

**Repository settings:** **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**. The deploy job uses the standard Pages environment name `github-pages` (see [deploy-pages usage](https://github.com/actions/deploy-pages#usage)). If your editor’s YAML schema underlines `github-pages` as invalid, that is usually schema lag, not a GitHub error — the workflow matches GitHub’s documented shape; `environment.name` may be written as an expression in `docs.yml` so strict validators accept it while runtime still targets `github-pages`.

## Coverage thresholds

`jest.config.js` sets modest global thresholds on `lib/`, `hooks/`, and `contexts/`. Raise them as the suite grows.

## Branch protections (recommended)

Require these checks on PRs to `main`:

- `lint`
- `docs-verify`
- `unit-test`
- `e2e-smoke`

Disallow force-push to `main` where practical.

## Next

[Release & EAS](./release.md) — versioning, tags, and manual store builds.
