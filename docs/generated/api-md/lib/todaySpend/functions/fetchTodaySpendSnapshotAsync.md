# Function: fetchTodaySpendSnapshotAsync()

> **fetchTodaySpendSnapshotAsync**(): `Promise`\<[`TodaySpendSnapshot`](../interfaces/TodaySpendSnapshot.md) \| `null`\>

Sum `amount` for rows where `expense_date` equals today’s local `YYYY-MM-DD`.

## Returns

`Promise`\<[`TodaySpendSnapshot`](../interfaces/TodaySpendSnapshot.md) \| `null`\>

`null` if unauthenticated or on query error (caller treats as unknown spend).
