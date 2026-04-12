/**
 * Dashboard analytics: month summaries, rolling weeks, merchants, category breakdown, trends, and recent activity.
 *
 * @remarks
 * - Query key prefix: `['dashboard', ...]`.
 * - Most hooks use `staleTime` around two minutes unless noted.
 * - Category charts use `aggregateSpendingByCategory` from `lib/categoryAggregation` on in-memory expense rows.
 */

import { useQuery } from '@tanstack/react-query';
import { toLocalISODateString } from '../lib/utils';
import { supabase } from '../lib/supabase';
import {
  aggregateSpendingByCategory,
  ExpenseForCategoryAggregation,
} from '../lib/categoryAggregation';
import { EXPENSE_SELECT_WITH_LINES, ExpenseWithCategory } from './useExpenses';

const DASHBOARD_KEY = ['dashboard'];

export interface DashboardStats {
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
  totalExpenses: number;
}

export interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface MonthlySpending {
  month: string;
  label: string;
  amount: number;
}

export interface WeekComparison {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
}

export interface MerchantSpend {
  merchant: string;
  amount: number;
  percentage: number;
}

/**
 * Get date range helpers
 */
function getMonthRange(monthsAgo: number = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);

  return {
    start: toLocalISODateString(start),
    end: toLocalISODateString(end),
  };
}

/** Inclusive local-date range for the last 7 days ending `endDate`, and the prior 7 days. */
function getRollingWeekPairRanges(): {
  thisStart: string;
  thisEnd: string;
  lastStart: string;
  lastEnd: string;
} {
  const endThis = new Date();
  const startThis = new Date(endThis);
  startThis.setDate(endThis.getDate() - 6);

  const endLast = new Date(startThis);
  endLast.setDate(startThis.getDate() - 1);
  const startLast = new Date(endLast);
  startLast.setDate(endLast.getDate() - 6);

  return {
    thisStart: toLocalISODateString(startThis),
    thisEnd: toLocalISODateString(endThis),
    lastStart: toLocalISODateString(startLast),
    lastEnd: toLocalISODateString(endLast),
  };
}

/**
 * This month vs last month totals, percent change, and total expense count for the user.
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const thisMonthRange = getMonthRange(0);
      const lastMonthRange = getMonthRange(1);

      // Fetch this month's expenses
      const { data: thisMonthData, error: thisMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', thisMonthRange.start)
        .lte('expense_date', thisMonthRange.end);

      if (thisMonthError) throw thisMonthError;

      // Fetch last month's expenses
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', lastMonthRange.start)
        .lte('expense_date', lastMonthRange.end);

      if (lastMonthError) throw lastMonthError;

      // Fetch total count
      const { count, error: countError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      const thisMonth = (thisMonthData || []).reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const lastMonth = (lastMonthData || []).reduce(
        (sum, e) => sum + e.amount,
        0
      );

      const changePercent =
        lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;

      return {
        thisMonth,
        lastMonth,
        changePercent,
        totalExpenses: count || 0,
      };
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}

/**
 * Compare spend in the last 7 local calendar days vs the prior 7 days.
 * @throws Error `"Not authenticated"` if there is no Supabase user.
 */
export function useWeekComparison() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'weekCompare'],
    queryFn: async (): Promise<WeekComparison> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { thisStart, thisEnd, lastStart, lastEnd } = getRollingWeekPairRanges();

      const [{ data: thisData, error: e1 }, { data: lastData, error: e2 }] =
        await Promise.all([
          supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('expense_date', thisStart)
            .lte('expense_date', thisEnd),
          supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('expense_date', lastStart)
            .lte('expense_date', lastEnd),
        ]);

      if (e1) throw e1;
      if (e2) throw e2;

      const thisWeek = (thisData || []).reduce((s, r) => s + r.amount, 0);
      const lastWeek = (lastData || []).reduce((s, r) => s + r.amount, 0);
      const changePercent =
        lastWeek === 0 ? 0 : ((thisWeek - lastWeek) / lastWeek) * 100;

      return { thisWeek, lastWeek, changePercent };
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Top N merchants by summed `amount` in the current calendar month (unknown/empty merchant → `"Unknown"`).
 * @param limit - Max rows after sorting descending by spend (default 5).
 */
export function useTopMerchants(limit: number = 5) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'merchants', limit],
    queryFn: async (): Promise<MerchantSpend[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const range = getMonthRange(0);
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, merchant')
        .eq('user_id', user.id)
        .gte('expense_date', range.start)
        .lte('expense_date', range.end);

      if (error) throw error;

      const totals = new Map<string, number>();
      for (const row of data || []) {
        const name = (row.merchant || 'Unknown').trim() || 'Unknown';
        totals.set(name, (totals.get(name) || 0) + row.amount);
      }

      const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, limit);
      const sum = top.reduce((s, [, a]) => s + a, 0);

      return top.map(([merchant, amount]) => ({
        merchant,
        amount,
        percentage: sum === 0 ? 0 : (amount / sum) * 100,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Current calendar month spending allocated by category, including split line items via `aggregateSpendingByCategory`.
 * @returns Percentages are shares of the month total (0 if no spend).
 */
export function useSpendingByCategory() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'byCategory'],
    queryFn: async (): Promise<CategorySpending[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const thisMonthRange = getMonthRange(0);

      const { data, error } = await supabase
        .from('expenses')
        .select(
          `amount, category_id, categories(name, color), expense_line_items(amount, category_id, position, categories(name, color))`
        )
        .eq('user_id', user.id)
        .gte('expense_date', thisMonthRange.start)
        .lte('expense_date', thisMonthRange.end)
        .order('position', {
          referencedTable: 'expense_line_items',
          ascending: true,
        });

      if (error) throw error;

      for (const row of data || []) {
        const lines = row.expense_line_items;
        if (Array.isArray(lines)) {
          lines.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        }
      }

      const categoryMap = aggregateSpendingByCategory(
        (data || []) as unknown as ExpenseForCategoryAggregation[]
      );

      const total = Array.from(categoryMap.values()).reduce(
        (sum, c) => sum + c.amount,
        0
      );

      return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categoryColor: data.color,
        amount: data.amount,
        percentage: total === 0 ? 0 : (data.amount / total) * 100,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Per-calendar-month totals for the last `months` months (including current), one Supabase query per month.
 * @param months - Number of past months to include (default 6); older months first in the returned array.
 */
export function useSpendingTrend(months: number = 6) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'trend', months],
    queryFn: async (): Promise<MonthlySpending[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const results: MonthlySpending[] = [];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      // Fetch data for each month
      for (let i = months - 1; i >= 0; i--) {
        const range = getMonthRange(i);
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const { data, error } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('expense_date', range.start)
          .lte('expense_date', range.end);

        if (error) throw error;

        const total = (data || []).reduce((sum, e) => sum + e.amount, 0);

        results.push({
          month: range.start,
          label: monthNames[date.getMonth()],
          amount: total,
        });
      }

      return results;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Latest `limit` expenses for the user (by `expense_date` desc) using the same select shape as `useExpenses` (`EXPENSE_SELECT_WITH_LINES`).
 */
export function useRecentExpenses(limit: number = 5) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'recent', limit],
    queryFn: async (): Promise<ExpenseWithCategory[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT_WITH_LINES)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('position', {
          referencedTable: 'expense_line_items',
          ascending: true,
        })
        .limit(limit);

      if (error) throw error;

      for (const row of data || []) {
        const lines = row.expense_line_items;
        if (Array.isArray(lines)) {
          lines.sort((a, b) => a.position - b.position);
        }
      }

      return data || [];
    },
  });
}
