# Function: useSpendingTotal()

> **useSpendingTotal**(`startDate`, `endDate`): `UseQueryResult`\<`number`, `Error`\>

Sum of `amount` for all expenses in `[startDate, endDate]` inclusive (`expense_date` column).

## Parameters

### startDate

`string`

ISO `YYYY-MM-DD` (local calendar semantics should match stored values).

### endDate

`string`

ISO `YYYY-MM-DD`, inclusive upper bound.

## Returns

`UseQueryResult`\<`number`, `Error`\>

## Throws

Error `"Not authenticated"` if there is no Supabase user.
