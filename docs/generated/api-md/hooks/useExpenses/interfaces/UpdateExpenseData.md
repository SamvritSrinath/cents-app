# Interface: UpdateExpenseData

Partial update by expense `id`; include `line_items` to replace or clear splits.

## Extends

- `Partial`\<`Omit`\<[`CreateExpenseData`](CreateExpenseData.md), `"line_items"`\>\>

## Properties

### amount?

> `optional` **amount?**: `number`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`amount`](CreateExpenseData.md#amount)

***

### category\_id?

> `optional` **category\_id?**: `string` \| `null`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`category_id`](CreateExpenseData.md#category_id)

***

### currency?

> `optional` **currency?**: `string`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`currency`](CreateExpenseData.md#currency)

***

### description?

> `optional` **description?**: `string` \| `null`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`description`](CreateExpenseData.md#description)

***

### expense\_date?

> `optional` **expense\_date?**: `string`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`expense_date`](CreateExpenseData.md#expense_date)

***

### id

> **id**: `string`

***

### line\_items?

> `optional` **line\_items?**: [`ExpenseLineItemInput`](ExpenseLineItemInput.md)[]

When set, replaces all line items; `[]` clears splits. Omit to leave lines unchanged.

***

### merchant?

> `optional` **merchant?**: `string` \| `null`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`merchant`](CreateExpenseData.md#merchant)

***

### receipt\_url?

> `optional` **receipt\_url?**: `string` \| `null`

#### Inherited from

[`CreateExpenseData`](CreateExpenseData.md).[`receipt_url`](CreateExpenseData.md#receipt_url)
