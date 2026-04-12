# Function: aggregateSpendingByCategory()

> **aggregateSpendingByCategory**(`expenses`, `uncategorizedLabel?`, `uncategorizedColor?`): `Map`\<`string` \| `null`, \{ `amount`: `number`; `color`: `string`; `name`: `string`; \}\>

## Parameters

### expenses

[`ExpenseForCategoryAggregation`](../type-aliases/ExpenseForCategoryAggregation.md)[]

In-memory rows (e.g. from a Supabase select with line items).

### uncategorizedLabel?

`string` = `DEFAULT_UNCAT`

Label for null category id bucket.

### uncategorizedColor?

`string` = `DEFAULT_COLOR`

Fallback color for uncategorized bucket.

## Returns

`Map`\<`string` \| `null`, \{ `amount`: `number`; `color`: `string`; `name`: `string`; \}\>

Map from `category_id` (null allowed) to rolled-up amount and display name/color.
