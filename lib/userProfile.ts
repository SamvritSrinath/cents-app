import { User } from '@supabase/supabase-js';

export function getUserDisplayName(user: User | null, fullName?: string | null): string {
  const trimmedProfileName = fullName?.trim();
  if (trimmedProfileName) return trimmedProfileName;

  const metadataFullName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.name as string | undefined)?.trim();
  if (metadataFullName) return metadataFullName;

  const emailPrefix = user?.email?.split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return 'User';
}
