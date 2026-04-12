# Function: useTopMerchants()

> **useTopMerchants**(`limit?`): `UseQueryResult`\<[`MerchantSpend`](../interfaces/MerchantSpend.md)[], `Error`\>

Top N merchants by summed `amount` in the current calendar month (unknown/empty merchant → `"Unknown"`).

## Parameters

### limit?

`number` = `5`

Max rows after sorting descending by spend (default 5).

## Returns

`UseQueryResult`\<[`MerchantSpend`](../interfaces/MerchantSpend.md)[], `Error`\>
