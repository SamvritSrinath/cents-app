/**
 * Build-time checks for required public Supabase configuration.
 *
 * @remarks
 * `EXPO_PUBLIC_*` variables are embedded at bundle time. EAS and other cloud builders **do not** read `.env.local`;
 * set the same variable names in the Expo dashboard (or EAS secrets) for preview/production builds.
 */

/** @returns True when URL or publishable key is missing or whitespace-only after trim. */
export function isMissingSupabasePublicEnv(): boolean {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const key =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ?? '';
  return !url || !key;
}
