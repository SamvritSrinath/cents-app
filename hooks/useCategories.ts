/**
 * @module useCategories
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * React Query hooks for fetching and managing expense categories from Supabase.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Category } from '../types/database';

const CATEGORIES_KEY = ['categories'];

/**
 * Fetch all categories (default + user-created)
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
        .or(`is_default.eq.true,user_id.eq.${user.id}`)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Categories rarely change, cache for 10 minutes
  });
}

/**
 * Get a single category by ID
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

export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string | null;
}

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
