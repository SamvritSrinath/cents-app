/**
 * @module useDashboard
 * @owner Dashboard
 * @updates 2024-12-31 - Initial implementation with analytics
 *
 * React Query hooks for dashboard statistics and charts.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { aggregateSpendingByCategory, ExpenseForCategoryAggregation } from '../lib/categoryAggregation';
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

/**
 * Get date range helpers
 */
function getMonthRange(monthsAgo: number = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Dashboard summary statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      
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

      const thisMonth = (thisMonthData || []).reduce((sum, e) => sum + e.amount, 0);
      const lastMonth = (lastMonthData || []).reduce((sum, e) => sum + e.amount, 0);
      
      const changePercent = lastMonth === 0 
        ? 0 
        : ((thisMonth - lastMonth) / lastMonth) * 100;

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
 * Spending breakdown by category (for pie chart)
 */
export function useSpendingByCategory() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'byCategory'],
    queryFn: async (): Promise<CategorySpending[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
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
        .order('position', { referencedTable: 'expense_line_items', ascending: true });

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

      const total = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.amount, 0);

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
 * Monthly spending trend (for line chart)
 */
export function useSpendingTrend(months: number = 6) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'trend', months],
    queryFn: async (): Promise<MonthlySpending[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const results: MonthlySpending[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
 * Recent expenses for dashboard widget
 */
export function useRecentExpenses(limit: number = 5) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'recent', limit],
    queryFn: async (): Promise<ExpenseWithCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT_WITH_LINES)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('position', { referencedTable: 'expense_line_items', ascending: true })
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
