# Function: useRecentExpenses()

> **useRecentExpenses**(`limit?`): `UseQueryResult`\<[`ExpenseWithCategory`](../../useExpenses/interfaces/ExpenseWithCategory.md)[], `Error`\>

Latest `limit` expenses for the user (by `expense_date` desc) using the same select shape as `useExpenses` (`EXPENSE_SELECT_WITH_LINES`).

## Parameters

### limit?

`number` = `5`

## Returns

`UseQueryResult`\<[`ExpenseWithCategory`](../../useExpenses/interfaces/ExpenseWithCategory.md)[], `Error`\>
