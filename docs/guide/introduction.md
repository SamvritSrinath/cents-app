---
title: Introduction
description: Why Cents exists, who it is for, and what we optimize for.
---

# Introduction

## Motivation

Personal finance apps should feel **fast** on a phone, **trustworthy** with sensitive spending data, and **honest** about what runs on-device versus in the cloud. Cents is an **Android-first** [Expo](https://expo.dev/) app that pairs a familiar mobile UX with a **Supabase** backend so you own auth, data, and policies — without shipping service-role secrets to clients.

This documentation is written for **contributors**, **operators** validating a deployment, and **forkers** who want to adapt the stack. If you only need to run the app locally, skip ahead to [Getting started](./getting-started.md).

## Documentation map

| Guide | Use it when you… |
| --- | --- |
| [Getting started](./getting-started.md) | Clone, env vars, Supabase, first `expo start`. |
| [Architecture](./architecture.md) | Trace screens → hooks → Supabase and shared UI patterns. |
| [Backend & security](./backend-security.md) | Audit RLS, storage, keys, and baseline migrations (including per-user categories). |
| [Receipt OCR service](./ocr-service.md) | Run or harden the FastAPI + PaddleOCR sidecar. |
| [Performance](./performance.md) | Checklist before calling a build “done.” |
| [CI & local checks](./ci-and-quality.md) | Mirror CI, regenerate pipeline/API docs, understand the docs deploy workflow. |
| [Release & EAS](./release.md) | Ship binaries outside of CI. |
| [API reference (TypeDoc)](/api/index.html) | Read function-level docs from source. |

## Product pillars

These are intentional product and engineering choices, not afterthoughts:

1. **Receipt OCR is a crux** — Turning a photo into structured totals, merchants, and line items is the hardest part of “fast expense capture.” Cents wires to a **self-hostable** PaddleOCR FastAPI service (shared with Expensely) so you are not locked into a proprietary, metered OCR API. Operating that service well — network, HTTPS, and eventually auth in front of `/ocr` — is part of running the product seriously ([Receipt OCR service](./ocr-service.md); client code in `lib/receiptOcr.ts`, see [TypeDoc: lib/receiptOcr](/api/modules/lib_receiptOcr.html)).

2. **Local-first workflow** — Day-to-day development targets **Expo Go** and your own machine; CI uses bundle export smoke tests instead of burning cloud device minutes. Production data still lives in **your** Supabase project; you control regions, backups, and RLS.

3. **No paywall in the model** — The app and docs describe an open stack (MIT-licensed client, your Supabase bill, optional OCR you host). There is no documented “unlock premium sync” gate — monetization, if any, is your deployment choice, not a hard-coded subscription layer in this repo.

## Goals

- **Android-first** development: Expo Go for day-to-day iteration; EAS or local native builds when you need a standalone binary ([Release & EAS](./release.md)).
- **Security and performance as first principles**: documented defaults, RLS expectations, and a concrete performance checklist ([Performance](./performance.md)).
- **Tight Supabase integration**: auth, Postgres, and Storage with hooks built on TanStack Query ([Architecture](./architecture.md)).

## Product scope (today)

- Email/password auth (sign up, sign in, password reset).
- Expense tracking with per-user categories.
- Dashboard analytics (trends, category breakdown, merchants).
- Receipt-related fields and OCR integration behind a configurable API URL ([Receipt OCR service](./ocr-service.md)).

## Non-goals (for now)

- Custom native modules that break **Expo Go** compatibility for core flows.
- Coupled release orchestration with other products in your monorepo — Cents versions and ships on its own cadence.

## Design principles

1. **Least privilege** — Only publishable Supabase keys in the client; never the service role ([Backend & security](./backend-security.md)).
2. **Explicit data ownership** — Mutations set `user_id`; queries assume RLS but still stay user-scoped in application code.
3. **Documented operations** — CI steps, generated pipeline reference, and TypeDoc output stay in sync with the repo ([CI & local checks](./ci-and-quality.md)).

## Where things live in the repo

| Area | Path |
| --- | --- |
| Screens (Expo Router) | `app/` |
| Shared UI | `components/` |
| Data hooks (React Query + Supabase) | `hooks/` |
| Reusable logic | `lib/` |
| Theme tokens | `theme/` |
| SQL migrations (reference) | `supabase/migrations/` |

## Next

[Getting started](./getting-started.md) — environment variables, Supabase, and running Expo.
