const FALLBACK_CATEGORY_ICONS: Record<string, string> = {
  groceries: '🛒',
  grocery: '🛒',
  food: '🍔',
  dining: '🍽️',
  coffee: '☕',
  transport: '🚗',
  transportation: '🚗',
  travel: '✈️',
  home: '🏠',
  rent: '🏠',
  utilities: '⚡',
  health: '💊',
  healthcare: '🏥',
  pharmacy: '💊',
  entertainment: '🎬',
  shopping: '🛍️',
  clothing: '👕',
  gifts: '🎁',
  education: '📚',
  fitness: '🏋️',
  pets: '🐕',
  kids: '👶',
  salary: '💰',
  bills: '🧾',
  subscriptions: '📱',
  work: '💼',
  savings: '💰',
  uncategorized: '📦',
};

export function getCategoryIcon(
  name?: string | null,
  icon?: string | null
): string {
  const trimmedIcon = icon?.trim();
  if (trimmedIcon) return trimmedIcon;

  const normalizedName = name?.trim().toLowerCase() || '';
  return FALLBACK_CATEGORY_ICONS[normalizedName] || '📦';
}
