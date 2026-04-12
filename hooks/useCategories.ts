/**
 * User-owned rows in `public.categories` (see `useCategories` query filter).
 *
 * @remarks
 * - Mutations always set `is_default: false` on insert; seeding defaults is a server/migration concern.
 * - List query uses `staleTime` 10 minutes because categories change infrequently.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Category } from '../types/database';

const CATEGORIES_KEY = ['categories'];

/**
 * Categories with `user_id` equal to the signed-in user, ordered by name.
 *
 * @remarks Shared/default categories must be readable under the same predicate in your RLS (e.g. duplicated `user_id` or a separate query); this hook only applies `.eq('user_id', user.id)`.
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async (): Promise<Category[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Categories rarely change, cache for 10 minutes
  });
}

/**
 * Single category by primary key; disabled when `id` is null.
 */
export function useCategory(id: string | null) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, id],
    queryFn: async (): Promise<Category | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/** Payload for {@link useCreateCategory}. */
export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string | null;
}

/** Insert a user category; invalidates the categories list on success. */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData): Promise<Category> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name: data.name.trim(),
          color: data.color,
          icon: data.icon || null,
          is_default: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** Delete a non-default category owned by the user (`is_default` must be false). */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_default', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
