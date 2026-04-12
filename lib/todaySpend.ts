/**
 * Lightweight read of today’s spending for notification copy and session sync.
 */

import { supabase } from './supabase';
import { toLocalISODateString } from './utils';

/** Aggregated total and dominant currency code for UI strings. */
export interface TodaySpendSnapshot {
  total: number;
  currency: string;
}

/**
 * Sum `amount` for rows where `expense_date` equals today’s local `YYYY-MM-DD`.
 * @returns `null` if unauthenticated or on query error (caller treats as unknown spend).
 */
export async function fetchTodaySpendSnapshotAsync(): Promise<TodaySpendSnapshot | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = toLocalISODateString(new Date());
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, currency')
    .eq('user_id', user.id)
    .eq('expense_date', today);

  if (error) return null;

  const rows = data || [];
  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
  const currency = rows.find((r) => r.currency)?.currency || 'USD';

  return { total, currency };
}
