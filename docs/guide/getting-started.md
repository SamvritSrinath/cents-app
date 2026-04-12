---
title: Getting started
description: Requirements, environment variables, Expo Go, and Supabase Storage for avatars.
---

# Getting started

## Why this section exists

You should be able to go from **zero → running app on a device** in a few commands, with a clear list of what must be true on the Supabase project before features like avatars and receipts work.

## Requirements

- **Node.js 20.x** and npm (lockfile: `package-lock.json`).
- **Expo Go** on a physical Android device, or an Android emulator with Expo tooling.

## Install

```bash
npm ci
```

## Environment

Copy the example file and add your Supabase project values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon / publishable key (never the service role) |
| `EXPO_PUBLIC_OCR_API_URL` | Optional base URL for the receipt OCR service ([OCR](./ocr-service.md)) |

`EXPO_PUBLIC_*` variables are embedded at bundle time. EAS and other cloud builders do **not** read `.env.local`; configure env there explicitly ([Release & EAS](./release.md)).

## Run with Expo Go

```bash
npx expo start
```

Scan the QR code in Expo Go. If LAN discovery fails:

```bash
npx expo start --tunnel
```

## Profile photos (Storage)

The app uploads avatars to a Supabase Storage bucket named **`avatars`**, at paths `{user_id}/avatar.{ext}`, and stores the public URL on `profiles.avatar_url`.

1. Create the bucket and policies (Dashboard or SQL). A reference migration lives at `supabase/migrations/20260410_avatars_storage_bucket.sql`.
2. Ensure authenticated users can **upload** only under their own `user_id` prefix and that **read** works for the URLs the app stores ([Backend & security](./backend-security.md)).

## Useful npm scripts

| Script | Use |
| --- | --- |
| `npm run start` | Expo dev server |
| `npm run android` | Expo with Android focus |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Jest (watch) |
| `npm run test:ci` | Jest CI mode with coverage |
| `npm run docs:dev` | Preview this documentation site locally |

## Next

- [Architecture](./architecture.md) — navigation, data flow, caching.
- [Backend & security](./backend-security.md) — RLS and keys checklist.
