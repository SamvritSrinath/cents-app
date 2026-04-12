import {
  formatDate,
  formatUsShortDate,
  isValidIsoDateString,
  toLocalISODateString,
} from './utils';

describe('isValidIsoDateString', () => {
  it('accepts real calendar dates', () => {
    expect(isValidIsoDateString('2024-03-15')).toBe(true);
    expect(isValidIsoDateString('2024-02-29')).toBe(true);
  });

  it('rejects invalid patterns and impossible dates', () => {
    expect(isValidIsoDateString('')).toBe(false);
    expect(isValidIsoDateString('24-03-15')).toBe(false);
    expect(isValidIsoDateString('2024-02-30')).toBe(false);
    expect(isValidIsoDateString('not-a-date')).toBe(false);
  });
});

describe('formatUsShortDate', () => {
  it('formats YYYY-MM-DD as US numeric', () => {
    expect(formatUsShortDate('2024-03-05')).toMatch(/03\/05\/2024/);
  });

  it('returns empty for unparseable input', () => {
    expect(formatUsShortDate('invalid')).toBe('');
  });
});

describe('formatDate', () => {
  it('defaults to MM/DD/YYYY style', () => {
    const d = new Date(2024, 0, 9);
    expect(formatDate(d)).toMatch(/01\/09\/2024/);
    expect(formatDate('2024-01-09')).toMatch(/01\/09\/2024/);
  });
});

describe('toLocalISODateString', () => {
  it('pads month and day', () => {
    const d = new Date(2025, 8, 7);
    expect(toLocalISODateString(d)).toBe('2025-09-07');
  });
});
