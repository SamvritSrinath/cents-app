import { Category } from '../types/database';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  groceries: [
    'grocery',
    'market',
    'whole foods',
    'trader joe',
    'safeway',
    'costco',
  ],
  food: [
    'restaurant',
    'cafe',
    'coffee',
    'doordash',
    'ubereats',
    'chipotle',
    'mcdonald',
  ],
  transport: ['uber', 'lyft', 'gas', 'fuel', 'shell', 'chevron', 'transit'],
  shopping: ['amazon', 'target', 'walmart', 'best buy', 'store'],
  utilities: ['electric', 'water', 'internet', 'phone', 'utility'],
  health: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'clinic'],
  entertainment: ['netflix', 'spotify', 'movie', 'cinema', 'ticket'],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function suggestCategoryIdFromReceiptInput(
  categories: Category[],
  merchant: string,
  description: string
): string | null {
  const haystack = `${merchant} ${description}`.toLowerCase();
  if (!haystack.trim()) return null;

  for (const category of categories) {
    const nameKey = normalize(category.name);
    const keywords = CATEGORY_KEYWORDS[nameKey] || [nameKey];
    const matched = keywords.some((keyword) => haystack.includes(keyword));

    if (matched) return category.id;
  }

  return null;
}
