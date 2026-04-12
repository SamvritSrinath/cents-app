# Variable: EXPENSE\_SELECT\_WITH\_LINES

> `const` **EXPENSE\_SELECT\_WITH\_LINES**: `"*, categories(*), expense_line_items(*, categories(*))"`

PostgREST `select` fragment for expense rows with primary category and nested line items (each with its own category).
Keep in sync with any screen that expects [ExpenseWithCategory](../interfaces/ExpenseWithCategory.md).
