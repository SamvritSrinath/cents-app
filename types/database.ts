/**
 * Domain and Supabase row shapes used across hooks and screens.
 *
 * @remarks
 * `Database` mirrors PostgREST `Insert`/`Update` helpers; keep aligned with migrations and generated types if you adopt `supabase gen types`.
 */

/** Single expense row in `public.expenses`. */
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category_id: string | null;
  merchant: string | null;
  description: string | null;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

/** Category row: user-owned or shared default (`is_default`, `user_id` may be null per RLS). */
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  user_id: string | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  created_at: string;
  updated_at: string;
}

/** Row from Supabase RPC get_budget_progress */
export interface BudgetProgressRow {
  budget_id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  period: string;
}

export interface ExpenseLineItem {
  id: string;
  expense_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  position: number;
  created_at: string;
}

export interface ParsedReceipt {
  merchant: string | null;
  total: number | null;
  date: string | null;
  currency: string;
  items: { name: string; price: number }[];
  rawText: string;
  confidence: number;
}

export interface Profile {
  id: string;
  email?: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Minimal generated-style schema map for typed `from('…').insert()` / `.update()` calls.
 */
export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at'>>;
      };
      expense_line_items: {
        Row: ExpenseLineItem;
        Insert: Omit<ExpenseLineItem, 'id' | 'created_at'>;
        Update: Partial<
          Omit<ExpenseLineItem, 'id' | 'expense_id' | 'created_at'>
        >;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
