/**
 * @module useProfile
 * @owner Auth
 * @updates 2024-12-31 - Initial implementation
 *
 * Hook for managing user profile (display name, avatar).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export function useProfile() {
  const queryClient = useQueryClient();

  // Fetch profile
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const seedName =
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            null;

          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                display_name: seedName,
              },
              { onConflict: 'id' }
            )
            .select()
            .single();

          if (insertError) throw insertError;
          return inserted;
        }

        throw error;
      }

      if (!data.display_name) {
        const metadataName =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          null;

        if (metadataName) {
          return {
            ...data,
            display_name: metadataName,
          };
        }
      }

      return data;
    },
  });

  // Update profile
  const updateMutation = useMutation({
    mutationFn: async (
      updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (typeof updates.display_name === 'string') {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            full_name: updates.display_name,
            name: updates.display_name,
            display_name: updates.display_name,
          },
        });
        if (authUpdateError) throw authUpdateError;
      }

      const payload = {
        id: user.id,
        ...updates,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (!error) return data;

      // Some environments have profile schema drift (e.g., missing `email` column
      // or constraints that reject upsert payloads). Keep name updates working by
      // treating profiles as best-effort after auth metadata succeeds.
      console.warn('Could not upsert profile row; falling back to metadata-only name sync:', error.message);

      const cachedProfile = queryClient.getQueryData<Profile | null>(['profile']);
      return {
        id: user.id,
        email: cachedProfile?.email ?? null,
        avatar_url: cachedProfile?.avatar_url || null,
        created_at: cachedProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name:
          (typeof updates.display_name === 'string'
            ? updates.display_name
            : cachedProfile?.display_name) ||
          null,
      } as Profile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
    },
  });

  return {
    ...query,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
