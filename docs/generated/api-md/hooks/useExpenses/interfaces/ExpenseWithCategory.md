# Interface: ExpenseWithCategory

Expense row plus primary `categories` join and optional ordered `expense_line_items`.

## Extends

- [`Expense`](../../../types/database/interfaces/Expense.md)

## Properties

### amount

> **amount**: `number`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`amount`](../../../types/database/interfaces/Expense.md#amount)

***

### categories

> **categories**: [`Category`](../../../types/database/interfaces/Category.md) \| `null`

***

### category\_id

> **category\_id**: `string` \| `null`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`category_id`](../../../types/database/interfaces/Expense.md#category_id)

***

### created\_at

> **created\_at**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`created_at`](../../../types/database/interfaces/Expense.md#created_at)

***

### currency

> **currency**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`currency`](../../../types/database/interfaces/Expense.md#currency)

***

### description

> **description**: `string` \| `null`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`description`](../../../types/database/interfaces/Expense.md#description)

***

### expense\_date

> **expense\_date**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`expense_date`](../../../types/database/interfaces/Expense.md#expense_date)

***

### expense\_line\_items?

> `optional` **expense\_line\_items?**: [`ExpenseLineItemWithCategory`](ExpenseLineItemWithCategory.md)[] \| `null`

***

### id

> **id**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`id`](../../../types/database/interfaces/Expense.md#id)

***

### merchant

> **merchant**: `string` \| `null`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`merchant`](../../../types/database/interfaces/Expense.md#merchant)

***

### receipt\_url

> **receipt\_url**: `string` \| `null`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`receipt_url`](../../../types/database/interfaces/Expense.md#receipt_url)

***

### updated\_at

> **updated\_at**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`updated_at`](../../../types/database/interfaces/Expense.md#updated_at)

***

### user\_id

> **user\_id**: `string`

#### Inherited from

[`Expense`](../../../types/database/interfaces/Expense.md).[`user_id`](../../../types/database/interfaces/Expense.md#user_id)
