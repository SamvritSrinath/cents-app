# Interface: Database

Minimal generated-style schema map for typed `from('…').insert()` / `.update()` calls.

## Properties

### public

> **public**: `object`

#### Tables

> **Tables**: `object`

##### Tables.budgets

> **budgets**: `object`

##### Tables.budgets.Insert

> **Insert**: `Omit`\<[`Budget`](Budget.md), `"id"` \| `"created_at"` \| `"updated_at"`\>

##### Tables.budgets.Row

> **Row**: [`Budget`](Budget.md)

##### Tables.budgets.Update

> **Update**: `Partial`\<`Omit`\<[`Budget`](Budget.md), `"id"` \| `"created_at"` \| `"updated_at"`\>\>

##### Tables.categories

> **categories**: `object`

##### Tables.categories.Insert

> **Insert**: `Omit`\<[`Category`](Category.md), `"id"`\>

##### Tables.categories.Row

> **Row**: [`Category`](Category.md)

##### Tables.categories.Update

> **Update**: `Partial`\<`Omit`\<[`Category`](Category.md), `"id"`\>\>

##### Tables.expense\_line\_items

> **expense\_line\_items**: `object`

##### Tables.expense\_line\_items.Insert

> **Insert**: `Omit`\<[`ExpenseLineItem`](ExpenseLineItem.md), `"id"` \| `"created_at"`\>

##### Tables.expense\_line\_items.Row

> **Row**: [`ExpenseLineItem`](ExpenseLineItem.md)

##### Tables.expense\_line\_items.Update

> **Update**: `Partial`\<`Omit`\<[`ExpenseLineItem`](ExpenseLineItem.md), `"id"` \| `"expense_id"` \| `"created_at"`\>\>

##### Tables.expenses

> **expenses**: `object`

##### Tables.expenses.Insert

> **Insert**: `Omit`\<[`Expense`](Expense.md), `"id"` \| `"created_at"` \| `"updated_at"`\>

##### Tables.expenses.Row

> **Row**: [`Expense`](Expense.md)

##### Tables.expenses.Update

> **Update**: `Partial`\<`Omit`\<[`Expense`](Expense.md), `"id"` \| `"created_at"` \| `"updated_at"`\>\>

##### Tables.profiles

> **profiles**: `object`

##### Tables.profiles.Insert

> **Insert**: `Omit`\<[`Profile`](Profile.md), `"created_at"` \| `"updated_at"`\>

##### Tables.profiles.Row

> **Row**: [`Profile`](Profile.md)

##### Tables.profiles.Update

> **Update**: `Partial`\<`Omit`\<[`Profile`](Profile.md), `"id"` \| `"created_at"` \| `"updated_at"`\>\>
