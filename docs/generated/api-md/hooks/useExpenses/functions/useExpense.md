# Function: useExpense()

> **useExpense**(`id`): `UseQueryResult`\<[`ExpenseWithCategory`](../interfaces/ExpenseWithCategory.md) \| `null`, `Error`\>

Single expense by id, scoped to the current user.

## Parameters

### id

`string` \| `null`

Expense primary key, or `null` to disable the query.

## Returns

`UseQueryResult`\<[`ExpenseWithCategory`](../interfaces/ExpenseWithCategory.md) \| `null`, `Error`\>

## Throws

Error `"Not authenticated"` if there is no Supabase user.
