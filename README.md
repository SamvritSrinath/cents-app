# Cents Mobile App

**Version:** 0.5.0 (see `package.json` and `app.json` → `expo.version`; release tag `v0.5.0`).

Android-first Expo app for secure, fast expense tracking connected to Supabase.

## Principles

- Security first (least privilege, RLS, no service keys on device).
- Performance first (cached queries, pagination, avoid heavy renders). See [docs/09-performance.md](docs/09-performance.md).

## Requirements

- Node.js 20.x
- npm (see `package-lock.json` for reproducible installs)

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on Android. If LAN fails:

```bash
npx expo start --tunnel
```

Setup details: [docs/02-setup.md](docs/02-setup.md)

## Docs

- [docs/01-overview.md](docs/01-overview.md)
- [docs/02-setup.md](docs/02-setup.md)
- [docs/03-architecture.md](docs/03-architecture.md)
- [docs/04-backend-audit.md](docs/04-backend-audit.md)
- [docs/05-ci.md](docs/05-ci.md) — CI overview; generated step list: [docs/generated/ci-pipeline.md](docs/generated/ci-pipeline.md)
- [docs/06-release.md](docs/06-release.md) — versioning, tags, EAS
- [docs/07-ocr-service.md](docs/07-ocr-service.md)
- [docs/09-performance.md](docs/09-performance.md)

## Categories

- **Expense form:** the main category on an expense is the default for the whole receipt unless you split by line.
- **Global default categories:** rows in Supabase `public.categories` with `is_default = true` (visible to all users per RLS). Seed or migrate with SQL; the mobile client cannot insert `is_default` rows. See optional migration `supabase/migrations/20260410_seed_default_groceries_category.sql`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
```

## Scripts

- `npm run start` — Expo dev server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm run test` — Jest (local)
- `npm run test:ci` — Jest with coverage (matches CI)
- `npm run format` / `npm run format:check` — Prettier
- `npm run generate-ci-docs` — Regenerate [docs/generated/ci-pipeline.md](docs/generated/ci-pipeline.md)

## Receipt categorization

- Expense creation includes category selection (custom categories are user-owned; defaults are shared).
- `receipt_url` is stored on expenses for scan pipelines; user-confirmed categories remain the source of truth.

## EAS

Create `eas.json` with `npx eas build:configure` if you do not have it yet. CI runs EAS builds on `main` when `EXPO_TOKEN` is set ([docs/05-ci.md](docs/05-ci.md)).
