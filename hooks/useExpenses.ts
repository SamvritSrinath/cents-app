/**
 * @module useExpenses
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation with CRUD operations
 *
 * React Query hooks for expense CRUD operations with Supabase.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Expense, Category, ExpenseLineItem } from '../types/database';

const EXPENSES_KEY = ['expenses'];
const PAGE_SIZE = 20;

/** Nested select for category breakdown and list/detail UIs */
export const EXPENSE_SELECT_WITH_LINES = `*, categories(*), expense_line_items(*, categories(*))`;

export interface ExpenseLineItemWithCategory extends ExpenseLineItem {
  categories: Category | null;
}

export interface ExpenseWithCategory extends Expense {
  categories: Category | null;
  expense_line_items?: ExpenseLineItemWithCategory[] | null;
}

export interface ExpenseLineItemInput {
  name: string;
  amount: number;
  category_id: string | null;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  searchQuery?: string;
}

export interface CreateExpenseData {
  amount: number;
  currency?: string;
  category_id?: string | null;
  merchant?: string | null;
  description?: string | null;
  expense_date: string;
  receipt_url?: string | null;
  /** When non-empty, expense is split by line for category/budget totals */
  line_items?: ExpenseLineItemInput[];
}

export interface UpdateExpenseData extends Partial<Omit<CreateExpenseData, 'line_items'>> {
  id: string;
  /** When set, replaces all line items; `[]` clears splits. Omit to leave lines unchanged. */
  line_items?: ExpenseLineItemInput[];
}

/**
 * Fetch expenses with infinite scroll pagination
 */
export function useExpenses(filters?: ExpenseFilters) {
  return useInfiniteQuery({
    queryKey: [...EXPENSES_KEY, 'list', filters],
    queryFn: async ({ pageParam = 0 }): Promise<ExpenseWithCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('expenses')
        .select(EXPENSE_SELECT_WITH_LINES)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('position', { referencedTable: 'expense_line_items', ascending: true })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }
      if (filters?.categoryId) {
        const { data: lineRows, error: lineErr } = await supabase
          .from('expense_line_items')
          .select('expense_id')
          .eq('category_id', filters.categoryId);

        if (lineErr) throw lineErr;

        const fromLines = [...new Set((lineRows || []).map((r) => r.expense_id))];

        if (fromLines.length > 0) {
          query = query.or(
            `category_id.eq.${filters.categoryId},id.in.(${fromLines.join(',')})`
          );
        } else {
          query = query.eq('category_id', filters.categoryId);
        }
      }
      if (filters?.searchQuery) {
        query = query.or(`merchant.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      for (const row of data || []) {
        if (row.expense_line_items?.length) {
          row.expense_line_items.sort(
            (a: ExpenseLineItemWithCategory, b: ExpenseLineItemWithCategory) =>
              a.position - b.position
          );
        }
      }
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    initialPageParam: 0,
  });
}

/**
 * Fetch a single expense by ID
 */
export function useExpense(id: string | null) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'detail', id],
    queryFn: async (): Promise<ExpenseWithCategory | null> => {
      if (!id) return null;

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT_WITH_LINES)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data?.expense_line_items?.length) {
        data.expense_line_items.sort(
          (a: ExpenseLineItemWithCategory, b: ExpenseLineItemWithCategory) =>
            a.position - b.position
        );
      }
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create a new expense
 */
async function replaceExpenseLineItems(
  expenseId: string,
  lineItems: ExpenseLineItemInput[]
): Promise<void> {
  const { error: delErr } = await supabase
    .from('expense_line_items')
    .delete()
    .eq('expense_id', expenseId);
  if (delErr) throw delErr;

  if (lineItems.length === 0) return;

  const rows = lineItems.map((li, i) => ({
    expense_id: expenseId,
    name: li.name,
    amount: li.amount,
    category_id: li.category_id,
    position: i,
  }));
  const { error: insErr } = await supabase.from('expense_line_items').insert(rows);
  if (insErr) throw insErr;
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: CreateExpenseData): Promise<Expense> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { line_items, ...rest } = expenseData;

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...rest,
          user_id: user.id,
          currency: expenseData.currency || 'USD',
        })
        .select()
        .single();

      if (error) throw error;

      if (line_items?.length) {
        try {
          await replaceExpenseLineItems(data.id, line_items);
        } catch (e) {
          await supabase.from('expenses').delete().eq('id', data.id);
          throw e;
        }
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate all expense queries to refetch
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Update an existing expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, line_items, ...updates }: UpdateExpenseData): Promise<Expense> => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      let data: Expense;

      if (Object.keys(updates).length > 0) {
        const res = await supabase
          .from('expenses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (res.error) throw res.error;
        data = res.data;
      } else {
        const res = await supabase
          .from('expenses')
          .select()
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (res.error) throw res.error;
        data = res.data;
      }

      if (line_items !== undefined) {
        await replaceExpenseLineItems(id, line_items);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: [...EXPENSES_KEY, 'detail', variables.id] });
    },
  });
}

/**
 * Delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Get total spending for a date range
 */
export function useSpendingTotal(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'total', startDate, endDate],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);

      if (error) throw error;
      return (data || []).reduce((sum, e) => sum + e.amount, 0);
    },
  });
}
