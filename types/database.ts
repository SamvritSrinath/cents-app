// Database types for Cents expense tracker

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
  period: 'monthly' | 'weekly';
  start_date: string;
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

// Supabase database schema types
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
        Insert: Omit<Budget, 'id'>;
        Update: Partial<Omit<Budget, 'id'>>;
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
