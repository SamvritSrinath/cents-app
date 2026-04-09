import { aggregateSpendingByCategory } from './categoryAggregation';

describe('aggregateSpendingByCategory', () => {
  const cat = (name: string, color: string) => ({ name, color });

  it('allocates full amount to expense category when no line items', () => {
    const map = aggregateSpendingByCategory([
      {
        amount: 100,
        category_id: 'c1',
        categories: cat('Food', '#111'),
        expense_line_items: [],
      },
    ]);
    expect(map.get('c1')?.amount).toBe(100);
  });

  it('splits by line item categories', () => {
    const map = aggregateSpendingByCategory([
      {
        amount: 50,
        category_id: 'grocery',
        categories: cat('Grocery', '#0f0'),
        expense_line_items: [
          {
            amount: 30,
            category_id: 'grocery',
            categories: cat('Grocery', '#0f0'),
          },
          {
            amount: 20,
            category_id: 'home',
            categories: cat('Home', '#00f'),
          },
        ],
      },
    ]);
    expect(map.get('grocery')?.amount).toBe(30);
    expect(map.get('home')?.amount).toBe(20);
  });

  it('uses parent category when line category_id is null', () => {
    const map = aggregateSpendingByCategory([
      {
        amount: 15,
        category_id: 'grocery',
        categories: cat('Grocery', '#0f0'),
        expense_line_items: [
          {
            amount: 15,
            category_id: null,
            categories: null,
          },
        ],
      },
    ]);
    expect(map.get('grocery')?.amount).toBe(15);
  });
});
