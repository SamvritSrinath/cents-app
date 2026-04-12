/**
 * @module avatarUpload
 *
 * Uploads a local image URI to Supabase Storage (`avatars` bucket) and returns a public URL.
 */

import { supabase } from './supabase';

export const AVATAR_BUCKET = 'avatars';

/**
 * Upload or replace the user's avatar object at `{userId}/avatar.{ext}`.
 */
export async function uploadProfileAvatarAsync(
  userId: string,
  localUri: string
): Promise<string> {
  const rawExt = localUri.split('.').pop()?.toLowerCase();
  const ext =
    rawExt === 'png' ||
    rawExt === 'webp' ||
    rawExt === 'jpg' ||
    rawExt === 'jpeg'
      ? rawExt === 'jpeg'
        ? 'jpg'
        : rawExt
      : 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const response = await fetch(localUri);
  const buffer = await response.arrayBuffer();
  const contentType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
