/**
 * @module todaySpend
 * @owner Notifications
 *
 * Today's expense total for local calendar day (matches expense_date in DB).
 */

import { supabase } from './supabase';
import { toLocalISODateString } from './utils';

export interface TodaySpendSnapshot {
  total: number;
  currency: string;
}

/**
 * Sum amounts for the current user's expenses dated today (device local date).
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
