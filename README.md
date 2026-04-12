<div align="center">

# Cents

**Android-first expense tracking · Expo SDK 54 · Supabase**

[![Mobile CI](https://github.com/SamvritSrinath/cents-app/actions/workflows/ci.yml/badge.svg)](https://github.com/SamvritSrinath/cents-app/actions/workflows/ci.yml)
[![Documentation](https://github.com/SamvritSrinath/cents-app/actions/workflows/docs.yml/badge.svg)](https://github.com/SamvritSrinath/cents-app/actions/workflows/docs.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live documentation](https://samvritsrinath.github.io/cents-app/)** · [API reference (TypeDoc)](https://samvritsrinath.github.io/cents-app/api/index.html)

</div>

Cents is a production-minded Expo (React Native) app for fast, secure expense capture backed by **Supabase** (auth, Postgres, Storage). Documentation is published to **GitHub Pages** on every push to `main`; pull requests stay green with lint, tests, TypeDoc markdown verification, and Expo Doctor.

**Multi-root workspace:** open [`cents.code-workspace`](cents.code-workspace) to work next to the **Expensely** web app in a sibling folder.

**Version:** see `package.json` and `app.json` → `expo.version`; tag releases accordingly ([release guide](docs/guide/release.md)).

## Why Cents

- **Security first** — RLS, publishable keys only on device, no service role in the client ([backend checklist](docs/guide/backend-security.md)).
- **Performance first** — Cached queries, pagination, and a documented profiling checklist ([performance](docs/guide/performance.md)).
- **Observable quality** — CI enforces formatting, types, tests, and generated docs; API surface is documented with **TSDoc** and [TypeDoc](https://typedoc.org/).

## Features

- Email/password auth, profiles, optional avatar uploads (Supabase Storage)
- Expenses with per-user categories
- Dashboard analytics (trends, categories, merchants)
- Receipt metadata and optional **PaddleOCR** HTTP service ([OCR](docs/guide/ocr-service.md))

## Tech stack

| Layer | Choice |
| --- | --- |
| App runtime | Expo ~54, React 19, React Native |
| Navigation | Expo Router |
| Server state | TanStack Query |
| Backend | Supabase (Auth, DB, Storage) |
| UI | React Native Paper, Gifted Charts |
| Docs site | VitePress + TypeDoc HTML |

## Screenshots

_Add Play Store / in-app screenshots here when ready — the [documentation site](https://samvritsrinath.github.io/cents-app/) is the canonical place for deep dives._

## Requirements

- Node.js **20.x**
- npm (use `package-lock.json` with `npm ci` in CI and for reproducible installs)

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android. If LAN fails:

```bash
npx expo start --tunnel
```

Full setup (env vars, Storage, scripts): **[docs/guide/getting-started.md](docs/guide/getting-started.md)**.

## Documentation site (local preview)

```bash
npm run docs:dev
```

Open the URL shown in the terminal (typically **`http://localhost:5173/cents-app/`**). **TypeDoc** API docs: **`/cents-app/api/`** (generated on first `docs:dev` or via `npm run docs:api:html`). Production build: `npm run docs:build`; serve locally: `npm run docs:preview`.

## Documentation

| Resource | Description |
| --- | --- |
| **[Documentation site](https://samvritsrinath.github.io/cents-app/)** | Guides, architecture, CI, release, OCR — built with VitePress |
| **[API reference](https://samvritsrinath.github.io/cents-app/api/index.html)** | TypeDoc HTML (search, hierarchy); source is TSDoc in `lib/`, `hooks/`, `types/database.ts` |
| **[docs/guide/](docs/guide/)** | Markdown source for the site (edit here) |
| **[docs/generated/api-md/](docs/generated/api-md/)** | TypeDoc **Markdown** output (committed; CI verifies drift) |
| **[docs/generated/ci-pipeline.md](docs/generated/ci-pipeline.md)** | Machine-readable CI steps (generated from `.github/workflows/ci.yml`) |

Local preview:

```bash
npm run docs:dev
```

Production build (TypeDoc HTML + VitePress):

```bash
npm run docs:build
```

## Categories

- **Per user:** The app lists only categories with `user_id = auth.uid()`. Migration `supabase/migrations/20260411_categories_per_user_rls.sql` backfills from legacy shared template rows, remaps expenses (and budgets if present), removes shared rows, tightens RLS, and adds a unique index on `(user_id, lower(trim(name)))`.
- **Expense form:** the main category on an expense is the default for the whole receipt unless you split by line.
- **Optional template seed:** `supabase/migrations/20260410_seed_default_groceries_category.sql` inserts a shared row; run it before `20260411` if you want that name materialized per user during migration (otherwise `20260411` is a no-op for inserts when no shared rows exist).

## Environment variables

Copy `.env.example` to `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
```

**Saved sign-in (Settings):** when enabled, the app stores only your **email** on this device (SecureStore) to pre-fill login. Passwords and session tokens are not stored there.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run start` | Expo dev server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run test` / `npm run test:ci` | Jest (local / CI coverage) |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run generate-ci-docs` | Regenerate `docs/generated/ci-pipeline.md` |
| `npm run docs:api` | Regenerate TypeDoc Markdown under `docs/generated/api-md` (CI verifies drift) |
| `npm run docs:api:html` | TypeDoc HTML → `docs/public/api` (also run by `docs:build`; VitePress copies `docs/public` to the site root) |
| `npm run docs:dev` / `npm run docs:build` | VitePress dev / production site |
| `npm run verify-api-docs` | Fail if API Markdown is out of date |
| `npm run test:e2e:ci` | Android bundle export smoke (also runs in CI after unit tests) |

## Receipt categorization

- Expense creation includes category selection; categories are user-owned rows in `public.categories`.
- `receipt_url` is stored on expenses for scan pipelines; user-confirmed categories remain the source of truth.

## EAS and store builds

CI **does not** run EAS. When you need a dev client or store binary, configure `eas.json` (`npx eas build:configure`), set `EXPO_PUBLIC_*` in the EAS project, and run builds locally. See **[docs/guide/release.md](docs/guide/release.md)**.

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)**. Security disclosures: **[SECURITY.md](SECURITY.md)**.

## License

MIT — see [LICENSE](LICENSE).
