import { ThemePreference } from './devicePreferences';

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
] as const;

export const THEME_OPTIONS: readonly {
  key: ThemePreference;
  label: string;
  description: string;
}[] = [
  { key: 'light', label: 'Light', description: 'Bright interface style' },
  { key: 'dark', label: 'Dark', description: 'Dimmed interface style' },
  { key: 'system', label: 'System', description: 'Follow your device setting' },
];

export function getCurrencyLabel(code: string): string {
  const match = CURRENCIES.find((currency) => currency.code === code);
  if (!match) return code;
  return `${match.symbol} ${match.name} (${match.code})`;
}
