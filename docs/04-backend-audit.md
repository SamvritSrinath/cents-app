# Backend Audit (Supabase)

This app assumes a Supabase backend with RLS (row-level security) and least-privilege access. Use this checklist to validate the project and avoid data leaks.

## Applied Baseline Migration
- `/Users/samvrit/Developer/cents-app/supabase/migrations/20260407_security_performance_baseline.sql`
- `/Users/samvrit/Developer/cents-app/supabase/migrations/20260407_function_search_path_hardening.sql`
- Includes RLS policies for `expenses`, `profiles`, `categories`.
- Includes private `receipts` storage bucket + object policies.
- Includes query performance indexes for expense lookups.
- Run from Supabase Dashboard SQL Editor (owner role) for full storage policy application.

## Remaining Manual Auth Step
- Enable leaked password protection in Supabase Auth settings. That warning is dashboard-side, not a SQL migration.

## Auth
- Email/password auth enabled.
- Confirm email verification behavior matches product needs.
- Disable unused auth providers.

## Tables
### `profiles`
- RLS enabled.
- Select policy: user can read only their row.
- Update policy: user can update only their row.

### `categories`
- If categories are user-specific: RLS enabled and scoped to user.
- If global categories: make read-only and keep writes restricted to admins.

### `expenses`
- RLS enabled.
- Select policy: `user_id = auth.uid()`.
- Insert policy: `user_id = auth.uid()`.
- Update policy: `user_id = auth.uid()`.
- Delete policy: `user_id = auth.uid()`.

## Storage (Receipts)
- Buckets set to private by default.
- Use signed URLs for receipt access.
- Restrict upload paths to the authenticated user.

## API Keys
- Never ship `service_role` keys to the app.
- Use only the public anon key in Expo (`EXPO_PUBLIC_*`).

## Observability
- Enable Supabase logs for auth and database.
- Set up alerts for abnormal access patterns.

## Performance
- Add indexes on `expenses.user_id`, `expenses.expense_date`, and `expenses.category_id`.
- For analytics queries, pre-aggregate if queries become expensive.
