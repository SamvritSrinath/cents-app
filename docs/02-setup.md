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

## Scripts
- `npm run start` - Start Expo
- `npm run android` - Start Expo with Android focus
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript
- `npm run test` - Jest

