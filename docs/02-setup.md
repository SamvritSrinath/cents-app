# Setup

## Requirements
- Node.js 20.x
- Expo Go (Android device) or Android emulator

## Install
```bash
npm install
```

## Environment
Copy the example file and fill in Supabase values.

```bash
cp .env.example .env.local
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Run (Expo Go)
```bash
npx expo start
```

Scan the QR code in Expo Go. If LAN fails, try:
```bash
npx expo start --tunnel
```

## Profile photos (Storage)

The app uploads avatars to the public Supabase Storage bucket **`avatars`** at paths `{user_id}/avatar.{ext}` and saves the public URL on `profiles.avatar_url`.

1. Create the bucket and policies (SQL Editor or Dashboard). A reference migration lives at [`supabase/migrations/20260410_avatars_storage_bucket.sql`](../supabase/migrations/20260410_avatars_storage_bucket.sql).
2. Ensure authenticated users can **upload** only under their own `user_id` folder and that **read** is allowed for public URLs (see [docs/04-backend-audit.md](04-backend-audit.md)).

## Scripts
- `npm run start` - Start Expo
- `npm run android` - Start Expo with Android focus
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript
- `npm run test` - Jest

