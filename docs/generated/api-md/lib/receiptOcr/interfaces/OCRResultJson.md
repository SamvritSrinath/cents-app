# Interface: OCRResultJson

Raw JSON shape returned by the PaddleOCR FastAPI service before mapping to [ParsedReceipt](../../../types/database/interfaces/ParsedReceipt.md).
Documented for TypeDoc; kept in sync with `expensely/ocr-service` response fields.

## Properties

### confidence?

> `optional` **confidence?**: `number`

***

### currency?

> `optional` **currency?**: `string`

***

### date?

> `optional` **date?**: `string` \| `null`

***

### items?

> `optional` **items?**: [`OCRLineItem`](OCRLineItem.md)[]

***

### merchant?

> `optional` **merchant?**: `string` \| `null`

***

### raw\_text?

> `optional` **raw\_text?**: `string`

***

### subtotal?

> `optional` **subtotal?**: `number` \| `null`

***

### total?

> `optional` **total?**: `number` \| `null`
