# Function: useSpendingTrend()

> **useSpendingTrend**(`months?`): `UseQueryResult`\<[`MonthlySpending`](../interfaces/MonthlySpending.md)[], `Error`\>

Per-calendar-month totals for the last `months` months (including current), one Supabase query per month.

## Parameters

### months?

`number` = `6`

Number of past months to include (default 6); older months first in the returned array.

## Returns

`UseQueryResult`\<[`MonthlySpending`](../interfaces/MonthlySpending.md)[], `Error`\>
