/**
 * Pure aggregation of expense rows into category totals.
 * When an expense has line items, amounts are allocated per line; otherwise the
 * expense amount goes to the expense's category_id.
 */

export type CategoryMeta = { name: string; color: string };

export type LineForAggregation = {
  amount: number;
  category_id: string | null;
  categories: CategoryMeta | null;
};

export type ExpenseForCategoryAggregation = {
  amount: number;
  category_id: string | null;
  categories: CategoryMeta | null;
  expense_line_items?: LineForAggregation[] | null;
};

const DEFAULT_UNCAT = 'Uncategorized';
const DEFAULT_COLOR = '#6b7280';

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
