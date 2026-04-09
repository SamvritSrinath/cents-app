# Cents Mobile App

Android-first Expo app for secure, fast expense tracking connected to Supabase.

## Principles
- Security first (least privilege, RLS, no service keys on device).
- Performance first (cached queries, pagination, avoid heavy renders).

## Quick Start
```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on Android. If LAN fails:
```bash
npx expo start --tunnel
```

## Docs
- `/Users/samvrit/Developer/cents-app/docs/01-overview.md`
- `/Users/samvrit/Developer/cents-app/docs/02-setup.md`
- `/Users/samvrit/Developer/cents-app/docs/03-architecture.md`
- `/Users/samvrit/Developer/cents-app/docs/04-backend-audit.md`
- `/Users/samvrit/Developer/cents-app/docs/05-ci.md`
- `/Users/samvrit/Developer/cents-app/docs/06-release.md`
- `/Users/samvrit/Developer/cents-app/supabase/migrations/20260407_security_performance_baseline.sql`
- `/Users/samvrit/Developer/cents-app/supabase/migrations/20260407_function_search_path_hardening.sql`

## Receipt Categorization
- Expense creation includes category selection.
- `receipt_url` is stored on expenses for scan pipelines.
- When scan extraction is added, category selection remains the user-confirmed source of truth.

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
```
## Scripts
- `npm run start` - Start Expo
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript check
- `npm run test` - Run tests
