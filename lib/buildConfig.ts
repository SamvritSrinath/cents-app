/**
 * EXPO_PUBLIC_* values are inlined when JavaScript is bundled.
 * `eas build` runs on Expo servers and does not read .env.local (gitignored).
 * Set the same names under Expo → Environment variables for preview/production.
 */

export function isMissingSupabasePublicEnv(): boolean {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const key =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ?? '';
  return !url || !key;
}
