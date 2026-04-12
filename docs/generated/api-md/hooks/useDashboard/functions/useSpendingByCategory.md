# Function: useSpendingByCategory()

> **useSpendingByCategory**(): `UseQueryResult`\<[`CategorySpending`](../interfaces/CategorySpending.md)[], `Error`\>

Current calendar month spending allocated by category, including split line items via `aggregateSpendingByCategory`.

## Returns

`UseQueryResult`\<[`CategorySpending`](../interfaces/CategorySpending.md)[], `Error`\>

Percentages are shares of the month total (0 if no spend).
