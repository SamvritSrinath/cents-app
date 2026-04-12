# Function: useCreateBudget()

> **useCreateBudget**(): `UseMutationResult`\<[`Budget`](../../../types/database/interfaces/Budget.md), `Error`, \{ `amount`: `number`; `category_id`: `string`; `period`: `"monthly"` \| `"weekly"` \| `"yearly"`; \}, `unknown`\>

Insert a budget for the current user; invalidates budget progress.

## Returns

`UseMutationResult`\<[`Budget`](../../../types/database/interfaces/Budget.md), `Error`, \{ `amount`: `number`; `category_id`: `string`; `period`: `"monthly"` \| `"weekly"` \| `"yearly"`; \}, `unknown`\>
