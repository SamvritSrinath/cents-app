# Function: useUpdateExpense()

> **useUpdateExpense**(): `UseMutationResult`\<[`Expense`](../../../types/database/interfaces/Expense.md), `Error`, [`UpdateExpenseData`](../interfaces/UpdateExpenseData.md), `unknown`\>

Patch expense fields and/or replace line items. Omitting `line_items` leaves lines unchanged.

## Returns

`UseMutationResult`\<[`Expense`](../../../types/database/interfaces/Expense.md), `Error`, [`UpdateExpenseData`](../interfaces/UpdateExpenseData.md), `unknown`\>

## Throws

Error `"Not authenticated"` or Supabase errors.
