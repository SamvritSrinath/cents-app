# Function: useCreateExpense()

> **useCreateExpense**(): `UseMutationResult`\<[`Expense`](../../../types/database/interfaces/Expense.md), `Error`, [`CreateExpenseData`](../interfaces/CreateExpenseData.md), `unknown`\>

Insert a row into `expenses`, optionally inserting `expense_line_items` in the same logical operation.

## Returns

`UseMutationResult`\<[`Expense`](../../../types/database/interfaces/Expense.md), `Error`, [`CreateExpenseData`](../interfaces/CreateExpenseData.md), `unknown`\>

## Remarks

If line insert fails, the parent expense row is deleted again to avoid orphans.

## Throws

Error `"Not authenticated"` or Supabase errors from insert/line replace.
