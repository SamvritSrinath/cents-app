---
layout: home

hero:
  name: Cents
  text: Expense tracking that respects your time and your data
  tagline: v0.6 · Android-first Expo app · Supabase · optional self-hosted OCR — guides here, TypeDoc under /api/
  actions:
    - theme: brand
      text: Read the guide
      link: /guide/introduction
    - theme: alt
      text: API (TypeDoc)
      link: /api/index.html
    - theme: alt
      text: View on GitHub
      link: https://github.com/SamvritSrinath/cents-app

features:
  - title: Receipt OCR as a crux
    details: Scan-to-structure depends on the same PaddleOCR pipeline as Expensely — self-host the service, point the app with EXPO_PUBLIC_OCR_API_URL, and keep your data out of a black-box SaaS OCR API. See the OCR guide and lib/receiptOcr in the API reference.
  - title: Local-first, no paywall
    details: Develop on Expo Go, run Supabase on your project, and own the stack. No subscription gate in the product model documented here — you bring auth, DB, and optional OCR infrastructure.
  - title: Security first
    details: Row-level security on Supabase, publishable keys only on device, and a backend audit checklist so you can verify every policy.
  - title: Observable quality
    details: TypeScript strict mode, split CI, and TSDoc-backed TypeDoc (Markdown + HTML) so public hooks and lib APIs stay documented in source and on the docs site.
  - title: Budgets, categories, dashboard
    details: Per-user categories (RLS-aligned), budgets, and dashboard hooks are documented in the architecture guide and in TypeDoc for hooks/useCategories, useBudgets, useDashboard, and useExpenses.
---

## What this site is

| Layer | What you get |
| --- | --- |
| **Guides** (this VitePress site) | Onboarding, architecture, security checklist, OCR operations, CI, release — written for contributors and operators. |
| **API** ([TypeDoc HTML](/api/index.html)) | Searchable modules and symbols from TSDoc in `hooks/`, `lib/`, and shared types — does not need to match VitePress styling. |
| **Generated Markdown** ([`docs/generated/api-md`](https://github.com/SamvritSrinath/cents-app/tree/main/docs/generated/api-md)) | Stable diffs in PRs; run `npm run docs:api` before committing API comment changes. |

The live site is built on every push to `main` (VitePress + TypeDoc HTML) and published with GitHub Actions → Pages.

## Where to go next

| If you want to… | Start here |
| --- | --- |
| Understand **why** Cents exists and what is in scope | [Introduction](/guide/introduction) |
| Clone the repo and run on a device | [Getting started](/guide/getting-started) |
| See how screens, hooks, and Supabase fit together | [Architecture](/guide/architecture) |
| Validate RLS, storage, and keys | [Backend & security](/guide/backend-security) |
| Mirror CI locally or read the generated pipeline | [CI & local checks](/guide/ci-and-quality) |
| Browse **functions and types** from source | [TypeDoc HTML](/api/index.html) (search, hierarchy — generated from TSDoc in source) |

Markdown API output for code review lives in the repo under [`docs/generated/api-md`](https://github.com/SamvritSrinath/cents-app/tree/main/docs/generated/api-md).
