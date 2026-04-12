# Function: useDeleteExpense()

> **useDeleteExpense**(): `UseMutationResult`\<`void`, `Error`, `string`, `unknown`\>

Hard-delete one expense owned by the current user (cascading line items depend on DB constraints).

## Returns

`UseMutationResult`\<`void`, `Error`, `string`, `unknown`\>

## Throws

Error `"Not authenticated"` or Supabase errors.
