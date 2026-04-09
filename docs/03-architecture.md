# Architecture

## App Structure
- `app/` uses Expo Router for navigation.
- `contexts/` provides global providers (auth, etc).
- `hooks/` wraps Supabase data access with React Query.
- `components/` contains shared UI components.
- `theme/` is the design system (colors, spacing, typography).

## Navigation
- Public auth screens under `app/(auth)`
- Protected tabs under `app/(tabs)`
- Expense details under `app/expenses/[id].tsx`

## Data Flow
- UI uses React Query hooks (`hooks/`) to access Supabase.
- All expense mutations ensure `user_id` is set and filtered.
- Auth state lives in `AuthContext` and drives routing.

## Security Defaults
- Only fetch data scoped to the authenticated user.
- Avoid logging sensitive values.
- Use Supabase RLS (see backend audit).

## Performance Defaults
- React Query cache with 5-minute stale time.
- Pagination for expenses list.
- Avoid heavy re-renders in chart components.

