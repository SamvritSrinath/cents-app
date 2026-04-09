import {
  mapOcrJsonToParsedReceipt,
  normalizeExpenseDateFromOcr,
  readOcrHttpErrorMessage,
} from './receiptOcr';

describe('mapOcrJsonToParsedReceipt', () => {
  it('maps snake_case API response to ParsedReceipt', () => {
    const parsed = mapOcrJsonToParsedReceipt({
      merchant: 'Target',
      total: 12.5,
      date: '2024-01-15',
      currency: 'USD',
      items: [{ name: 'Milk', price: 3.99 }],
      raw_text: 'TARGET\nMILK 3.99',
      confidence: 0.9,
    });

    expect(parsed).toEqual({
      merchant: 'Target',
      total: 12.5,
      date: '2024-01-15',
      currency: 'USD',
      items: [{ name: 'Milk', price: 3.99 }],
      rawText: 'TARGET\nMILK 3.99',
      confidence: 0.9,
    });
  });

  it('fills defaults for missing fields', () => {
    const parsed = mapOcrJsonToParsedReceipt({});
    expect(parsed.currency).toBe('USD');
    expect(parsed.items).toEqual([]);
    expect(parsed.rawText).toBe('');
    expect(parsed.confidence).toBe(0);
    expect(parsed.merchant).toBeNull();
    expect(parsed.total).toBeNull();
    expect(parsed.date).toBeNull();
  });
});

describe('readOcrHttpErrorMessage', () => {
  it('extracts string detail from FastAPI JSON', async () => {
    const res = new Response(JSON.stringify({ detail: 'OCR processing failed: test' }), {
      status: 500,
    });
    await expect(readOcrHttpErrorMessage(res)).resolves.toBe('OCR processing failed: test');
  });

  it('falls back to raw body', async () => {
    const res = new Response('plain error', { status: 502 });
    await expect(readOcrHttpErrorMessage(res)).resolves.toBe('plain error');
  });
});

describe('normalizeExpenseDateFromOcr', () => {
  it('passes through YYYY-MM-DD', () => {
    expect(normalizeExpenseDateFromOcr('2024-03-01')).toBe('2024-03-01');
  });

  it('parses ISO-like strings to YYYY-MM-DD', () => {
    const out = normalizeExpenseDateFromOcr('2024-03-01T12:00:00.000Z');
    expect(out).toBe('2024-03-01');
  });

  it('returns null for empty input', () => {
    expect(normalizeExpenseDateFromOcr(null)).toBeNull();
    expect(normalizeExpenseDateFromOcr('')).toBeNull();
  });
});
