/**
 * @module useBudgets
 * @owner Budgets
 *
 * React Query hooks for budgets and get_budget_progress RPC.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toLocalISODateString } from '../lib/utils';
import type { Budget, BudgetProgressRow } from '../types/database';

const BUDGET_PROGRESS_KEY = ['budgetProgress'] as const;

export function useBudgetProgress() {
  return useQuery({
    queryKey: BUDGET_PROGRESS_KEY,
    queryFn: async (): Promise<BudgetProgressRow[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_budget_progress', {
        p_user_id: user.id,
      });
      if (error) throw error;
      return (data || []) as BudgetProgressRow[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      category_id: string;
      amount: number;
      period: Budget['period'];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const start_date = toLocalISODateString(new Date());
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: input.category_id,
          amount: input.amount,
          period: input.period,
          start_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_PROGRESS_KEY });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      amount: number;
      period: Budget['period'];
    }) => {
      const { error } = await supabase
        .from('budgets')
        .update({
          amount: input.amount,
          period: input.period,
        })
        .eq('id', input.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_PROGRESS_KEY });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_PROGRESS_KEY });
    },
  });
}
