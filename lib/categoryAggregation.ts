/**
 * Pure functions to roll up expense rows (with optional line items) into per-category totals for charts and summaries.
 *
 * @remarks
 * - If `expense_line_items` is non-empty, each line’s `amount` is attributed to that line’s `category_id`.
 * - Otherwise the expense’s top-level `amount` is attributed to `category_id` (and joined `categories` metadata).
 */

/** Display metadata for a category bucket. */
export type CategoryMeta = { name: string; color: string };

/** Minimal line shape for aggregation input. */
export type LineForAggregation = {
  amount: number;
  category_id: string | null;
  categories: CategoryMeta | null;
};

/** Expense-shaped input: optional nested lines for split expenses. */
export type ExpenseForCategoryAggregation = {
  amount: number;
  category_id: string | null;
  categories: CategoryMeta | null;
  expense_line_items?: LineForAggregation[] | null;
};

const DEFAULT_UNCAT = 'Uncategorized';
const DEFAULT_COLOR = '#6b7280';

/**
 * @param expenses - In-memory rows (e.g. from a Supabase select with line items).
 * @param uncategorizedLabel - Label for null category id bucket.
 * @param uncategorizedColor - Fallback color for uncategorized bucket.
 * @returns Map from `category_id` (null allowed) to rolled-up amount and display name/color.
 */
export function aggregateSpendingByCategory(
  expenses: ExpenseForCategoryAggregation[],
  uncategorizedLabel: string = DEFAULT_UNCAT,
  uncategorizedColor: string = DEFAULT_COLOR
): Map<string | null, { amount: number; name: string; color: string }> {
  const categoryMap = new Map<
    string | null,
    { amount: number; name: string; color: string }
  >();

  for (const expense of expenses) {
    const lines = expense.expense_line_items;
    const hasLines = Array.isArray(lines) && lines.length > 0;

    if (!hasLines) {
      const catId = expense.category_id;
      const categoryData = expense.categories;
      const existing = categoryMap.get(catId) || {
        amount: 0,
        name: categoryData?.name || uncategorizedLabel,
        color: categoryData?.color || uncategorizedColor,
      };
      existing.amount += expense.amount;
      categoryMap.set(catId, existing);
      continue;
    }

    for (const line of lines!) {
      const catId = line.category_id ?? expense.category_id;
      const categoryData =
        line.category_id != null ? line.categories : expense.categories;
      const existing = categoryMap.get(catId) || {
        amount: 0,
        name: categoryData?.name || uncategorizedLabel,
        color: categoryData?.color || uncategorizedColor,
      };
      existing.amount += line.amount;
      categoryMap.set(catId, existing);
    }
  }

  return categoryMap;
}
