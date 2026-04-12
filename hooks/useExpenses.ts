/**
 * TanStack Query hooks for the `expenses` table, related `expense_line_items`, and joined `categories`.
 *
 * @remarks
 * - Every query and mutation requires an authenticated Supabase session; otherwise the queryFn throws `"Not authenticated"`.
 * - Rows are always filtered with `.eq('user_id', user.id)` in application code; **RLS must still enforce** the same rule.
 * - Successful create/update/delete mutations invalidate `['expenses']` and `['dashboard']` keys (and detail keys for updates).
 * - Split expenses: when `line_items` are present, category/budget logic uses per-line `category_id` and amounts; see {@link CreateExpenseData.line_items}.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Expense, Category, ExpenseLineItem } from '../types/database';

const EXPENSES_KEY = ['expenses'];
const PAGE_SIZE = 20;

/**
 * PostgREST `select` fragment for expense rows with primary category and nested line items (each with its own category).
 * Keep in sync with any screen that expects {@link ExpenseWithCategory}.
 */
export const EXPENSE_SELECT_WITH_LINES = `*, categories(*), expense_line_items(*, categories(*))`;

/** One line on a split expense, including the joined category row (may be null if FK missing). */
export interface ExpenseLineItemWithCategory extends ExpenseLineItem {
  categories: Category | null;
}

/** Expense row plus primary `categories` join and optional ordered `expense_line_items`. */
export interface ExpenseWithCategory extends Expense {
  categories: Category | null;
  expense_line_items?: ExpenseLineItemWithCategory[] | null;
}

/** Payload line for create/update when splitting an expense across categories. */
export interface ExpenseLineItemInput {
  name: string;
  amount: number;
  category_id: string | null;
}

/** Optional filters for the infinite expense list. */
export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  searchQuery?: string;
}

/** Fields accepted by {@link useCreateExpense}; `line_items` triggers split behavior. */
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

/** Partial update by expense `id`; include `line_items` to replace or clear splits. */
export interface UpdateExpenseData extends Partial<
  Omit<CreateExpenseData, 'line_items'>
> {
  id: string;
  /** When set, replaces all line items; `[]` clears splits. Omit to leave lines unchanged. */
  line_items?: ExpenseLineItemInput[];
}

/**
 * Infinite query of expenses (newest `expense_date` first), page size 20.
 *
 * @param filters - Optional date range, single category (matches header or any line), or merchant/description `ilike`.
 * @returns `useInfiniteQuery` result; pages are {@link ExpenseWithCategory}[].
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useExpenses(filters?: ExpenseFilters) {
  return useInfiniteQuery({
    queryKey: [...EXPENSES_KEY, 'list', filters],
    queryFn: async ({ pageParam = 0 }): Promise<ExpenseWithCategory[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('expenses')
        .select(EXPENSE_SELECT_WITH_LINES)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('position', {
          referencedTable: 'expense_line_items',
          ascending: true,
        })
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

        const fromLines = [
          ...new Set((lineRows || []).map((r) => r.expense_id)),
        ];

        if (fromLines.length > 0) {
          query = query.or(
            `category_id.eq.${filters.categoryId},id.in.(${fromLines.join(',')})`
          );
        } else {
          query = query.eq('category_id', filters.categoryId);
        }
      }
      if (filters?.searchQuery) {
        query = query.or(
          `merchant.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
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
 * Single expense by id, scoped to the current user.
 *
 * @param id - Expense primary key, or `null` to disable the query.
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useExpense(id: string | null) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'detail', id],
    queryFn: async (): Promise<ExpenseWithCategory | null> => {
      if (!id) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
 * Replace all line items for an expense (delete then insert). Used by create/update mutations.
 * @throws PostgREST error on failure.
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
  const { error: insErr } = await supabase
    .from('expense_line_items')
    .insert(rows);
  if (insErr) throw insErr;
}

/**
 * Insert a row into `expenses`, optionally inserting `expense_line_items` in the same logical operation.
 *
 * @remarks If line insert fails, the parent expense row is deleted again to avoid orphans.
 * @throws Error `"Not authenticated"` or Supabase errors from insert/line replace.
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: CreateExpenseData): Promise<Expense> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
 * Patch expense fields and/or replace line items. Omitting `line_items` leaves lines unchanged.
 *
 * @throws Error `"Not authenticated"` or Supabase errors.
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      line_items,
      ...updates
    }: UpdateExpenseData): Promise<Expense> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      queryClient.invalidateQueries({
        queryKey: [...EXPENSES_KEY, 'detail', variables.id],
      });
    },
  });
}

/**
 * Hard-delete one expense owned by the current user (cascading line items depend on DB constraints).
 *
 * @throws Error `"Not authenticated"` or Supabase errors.
 */
export function useDeleteExpense() {
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
 * Sum of `amount` for all expenses in `[startDate, endDate]` inclusive (`expense_date` column).
 *
 * @param startDate - ISO `YYYY-MM-DD` (local calendar semantics should match stored values).
 * @param endDate - ISO `YYYY-MM-DD`, inclusive upper bound.
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useSpendingTotal(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'total', startDate, endDate],
    queryFn: async (): Promise<number> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
