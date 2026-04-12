/**
 * Date, currency, and formatting helpers biased toward **local calendar** dates (`YYYY-MM-DD`) and US display defaults.
 */

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** US short numeric: MM/DD/YYYY */
export const US_SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

/**
 * YYYY-MM-DD for the device's local calendar day (not UTC).
 */
export function toLocalISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse a value for display/filtering: date-only strings are local calendar dates;
 * other strings use the Date parser (timestamps with time/offset).
 */
export function parseCalendarOrDateString(input: string | Date): Date {
  if (input instanceof Date) return input;
  if (DATE_ONLY_RE.test(input)) {
    const [y, mo, d] = input.split('-').map(Number);
    return new Date(y, mo - 1, d);
  }
  return new Date(input);
}

/**
 * True if string is a valid calendar YYYY-MM-DD (local date parts match).
 */
export function isValidIsoDateString(s: string): boolean {
  if (!DATE_ONLY_RE.test(s)) return false;
  const [y, mo, day] = s.split('-').map(Number);
  const d = new Date(y, mo - 1, day);
  return (
    d.getFullYear() === y &&
    d.getMonth() === mo - 1 &&
    d.getDate() === day
  );
}

/** Format a stored YYYY-MM-DD (or Date) as MM/DD/YYYY for US display. */
export function formatUsShortDate(isoOrDate: string | Date): string {
  const d =
    typeof isoOrDate === 'string'
      ? parseCalendarOrDateString(isoOrDate)
      : isoOrDate;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', US_SHORT_DATE_OPTIONS);
}

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = US_SHORT_DATE_OPTIONS
): string {
  const d = typeof date === 'string' ? parseCalendarOrDateString(date) : date;
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format relative date (e.g., "Today", "Yesterday", "Dec 15")
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseCalendarOrDateString(date) : date;
  const now = new Date();
  const diffDays = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(d)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return formatDate(d);
}

/**
 * Combine class names (utility for conditional styling)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a UUID (for offline expense creation)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
