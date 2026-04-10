/**
 * Client for the expensely-compatible PaddleOCR FastAPI service (`POST /ocr`).
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { toLocalISODateString } from './utils';

import { ParsedReceipt } from '../types/database';

const MAX_SIDE_PX = 1600;
const JPEG_QUALITY = 0.85;

interface OCRLineItem {
  name: string;
  price: number;
}

interface OCRResultJson {
  merchant?: string | null;
  total?: number | null;
  subtotal?: number | null;
  date?: string | null;
  currency?: string;
  items?: OCRLineItem[];
  raw_text?: string;
  confidence?: number;
}

export function getOcrApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_OCR_API_URL?.trim();
  if (!url) {
    throw new Error(
      'Missing EXPO_PUBLIC_OCR_API_URL. Add it to .env.local (see .env.example).'
    );
  }
  return url.replace(/\/$/, '');
}

/** Parse FastAPI-style error bodies so users see the real server message. */
export async function readOcrHttpErrorMessage(
  response: Response
): Promise<string> {
  const text = await response.text();
  try {
    const j = JSON.parse(text) as { detail?: unknown };
    const d = j.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
      return d
        .map((item) =>
          typeof item === 'object' && item !== null && 'msg' in item
            ? String((item as { msg: string }).msg)
            : JSON.stringify(item)
        )
        .join('; ');
    }
  } catch {
    /* not JSON */
  }
  return text.trim() ? text.slice(0, 500) : `HTTP ${response.status}`;
}

export function mapOcrJsonToParsedReceipt(
  ocrResult: OCRResultJson
): ParsedReceipt {
  return {
    merchant: ocrResult.merchant ?? null,
    total: ocrResult.total ?? null,
    date: ocrResult.date ?? null,
    currency: ocrResult.currency || 'USD',
    items: Array.isArray(ocrResult.items) ? ocrResult.items : [],
    rawText: ocrResult.raw_text || '',
    confidence:
      typeof ocrResult.confidence === 'number' ? ocrResult.confidence : 0,
  };
}

/** Normalize OCR date strings to YYYY-MM-DD when possible. */
export function normalizeExpenseDateFromOcr(
  raw: string | null | undefined
): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return toLocalISODateString(d);
  }
  return s;
}

export async function prepareReceiptImageForOcr(
  localUri: string
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: MAX_SIDE_PX } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Upload a local image URI to the OCR service and return parsed receipt fields.
 */
export async function scanReceiptFromUri(
  imageUri: string
): Promise<ParsedReceipt> {
  const base = getOcrApiBaseUrl();
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${base}/ocr`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await readOcrHttpErrorMessage(response);
    throw new Error(`OCR failed (${response.status}): ${message}`);
  }

  const json = (await response.json()) as OCRResultJson;
  return mapOcrJsonToParsedReceipt(json);
}
