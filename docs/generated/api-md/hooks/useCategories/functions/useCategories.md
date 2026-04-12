# Function: useCategories()

> **useCategories**(): `UseQueryResult`\<[`Category`](../../../types/database/interfaces/Category.md)[], `Error`\>

Categories with `user_id` equal to the signed-in user, ordered by name.

## Returns

`UseQueryResult`\<[`Category`](../../../types/database/interfaces/Category.md)[], `Error`\>

## Remarks

Shared/default categories must be readable under the same predicate in your RLS (e.g. duplicated `user_id` or a separate query); this hook only applies `.eq('user_id', user.id)`.

## Throws

Error `"Not authenticated"` if there is no Supabase user.
