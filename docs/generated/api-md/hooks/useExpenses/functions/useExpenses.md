# Function: useExpenses()

> **useExpenses**(`filters?`): `UseInfiniteQueryResult`\<`InfiniteData`\<[`ExpenseWithCategory`](../interfaces/ExpenseWithCategory.md)[], `unknown`\>, `Error`\>

Infinite query of expenses (newest `expense_date` first), page size 20.

## Parameters

### filters?

[`ExpenseFilters`](../interfaces/ExpenseFilters.md)

Optional date range, single category (matches header or any line), or merchant/description `ilike`.

## Returns

`UseInfiniteQueryResult`\<`InfiniteData`\<[`ExpenseWithCategory`](../interfaces/ExpenseWithCategory.md)[], `unknown`\>, `Error`\>

`useInfiniteQuery` result; pages are [ExpenseWithCategory](../interfaces/ExpenseWithCategory.md)[].

## Throws

Error `"Not authenticated"` if there is no Supabase user.
