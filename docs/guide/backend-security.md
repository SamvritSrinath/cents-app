---
title: Backend and security
description: Supabase RLS, storage, and key hygiene — a checklist you can run against your project.
---

# Backend and security

## Why this document exists

Mobile clients are easy to inspect. **Row-level security (RLS)** and **least-privilege keys** are the real guarantees. This page collects what Cents assumes about your Supabase project so you can audit before shipping.

## Baseline migrations (reference)

The repo includes SQL you can apply from the Supabase SQL editor (owner role) for policies and indexes:

- `supabase/migrations/20260407_security_performance_baseline.sql` — RLS for `expenses`, `profiles`, `categories`; private `receipts` storage; useful indexes.
- `supabase/migrations/20260407_function_search_path_hardening.sql` — function `search_path` hardening.
- `supabase/migrations/20260411_categories_per_user_rls.sql` — categories scoped to `user_id = auth.uid()` only; data backfill from shared template rows; optional `create_default_categories` cleanup.

Storage policy nuances are easiest to validate in the Dashboard when something does not apply from SQL alone.

## Manual Auth dashboard step

Enable **leaked password protection** (and any other Auth hardening your product needs) in Supabase Auth settings. That is dashboard configuration, not a migration file.

## Auth

- Email/password (or your chosen providers) enabled intentionally.
- Confirm email verification behavior matches your product.
- Disable unused OAuth providers to shrink attack surface.

## Tables

### `profiles`

- RLS enabled.
- **Select:** user reads only their row.
- **Update:** user updates only their row.

### `categories`

- RLS: authenticated users **select** only rows with `user_id = auth.uid()`. **Insert / update / delete** follow the same ownership rules from the baseline migration (`is_default = false` on client-created rows).
- Do not rely on shared template rows visible to all users; run `20260411_categories_per_user_rls.sql` on older projects that still had `user_id IS NULL` categories.

### `expenses`

- RLS enabled.
- **Select / insert / update / delete:** `user_id = auth.uid()` (or equivalent tenant rule).

## Storage — receipts

- Buckets default to **private**.
- Prefer **signed URLs** for receipt access.
- Restrict upload paths to the authenticated user.

## Storage — avatars

- Public bucket **`avatars`** (or your chosen name) so `getPublicUrl` matches what the app stores on `profiles.avatar_url`.
- **Insert / update / delete:** object key prefix must match `auth.uid()` (see `supabase/migrations/20260410_avatars_storage_bucket.sql`).
- **Select:** public read is typical for profile images; tighten if you move to signed URLs and update the app accordingly.
- Constrain MIME types (`image/jpeg`, `image/png`, `image/webp`) and max size on the bucket.

## API keys

- **Never** ship `service_role` in Expo or any client bundle.
- Only **anon / publishable** keys in `EXPO_PUBLIC_*` variables.

## Observability

- Enable Supabase logs for Auth and Database.
- Alert on abnormal query volume or auth anomalies.

## Performance (database)

- Indexes on `expenses.user_id`, `expenses.expense_date`, and `expenses.category_id` are baseline expectations.
- If analytics queries grow heavy, consider aggregates or database-side rollups.

## Next

[Receipt OCR service](./ocr-service.md) — optional HTTP service and hardening notes.
