---
title: Receipt OCR service
description: Why OCR is a crux path for Cents, how the PaddleOCR FastAPI fits in, and local-first / no-paywall alignment.
---

# Receipt OCR service

## Why OCR is a crux — not a side feature

Manual entry does not scale for real-world receipts: taxes, tips, multi-line items, and fuzzy merchant strings are where users churn. **OCR plus a clear mapping layer** (`lib/receiptOcr`, `mapOcrJsonToParsedReceipt`) is the critical path from **camera or gallery** to **reviewable expense data**. Treat the OCR service as **infrastructure**: same importance tier as Supabase for auth/data — if it is down or misconfigured, scan flows fail even when the rest of the app is healthy.

That is why Cents targets a **self-hosted** FastAPI stack you can run next to your desk or in your VPC, instead of routing every image through a black-box SaaS with opaque pricing. It aligns with a **local-first** dev story (run `uvicorn` on localhost, point the emulator at `10.0.2.2`) and a **no-paywall product model**: the repo does not assume a metered third-party OCR subscription to unlock capture.

## Motivation (integration)

Cents sends receipt images to the same **PaddleOCR FastAPI** used by the **Expensely** web app so web and mobile share one OCR contract and one place to fix parsing bugs. The service is **optional** at build time: without `EXPO_PUBLIC_OCR_API_URL`, flows that depend on it should degrade gracefully or hide entry points.

## Configure the app

1. Copy `.env.example` to `.env.local` if needed.
2. Set **`EXPO_PUBLIC_OCR_API_URL`** to the service **base URL** (no trailing slash). The client calls `POST {base}/ocr` with multipart field **`file`**.

### Local development URLs

| Client | Typical base URL |
| --- | --- |
| iOS Simulator | `http://127.0.0.1:8000` |
| Android Emulator (OCR on host) | `http://10.0.2.2:8000` |
| Physical device | HTTPS (or tunneled) URL reachable from the phone |

`app.json` sets **`android.usesCleartextTraffic`: true** so HTTP works for local dev. For production, prefer **HTTPS** and tighten cleartext rules.

## Run the service

Implementation lives in the **expensely** repo: `expensely/ocr-service/`.

```bash
cd /path/to/expensely/ocr-service
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

See `expensely/ocr-service/README.md` for the API contract, `curl` examples, and deployment notes. Paddle wheels are platform-specific; Linux x86_64 is the common cloud target.

## Security

Historically the web client could call `/ocr` **without authentication**. For shared or production deployments, add **API keys**, **mTLS**, or a **gateway**, or proxy via Supabase Edge Functions so secrets are not embedded in a public client.

## CORS

FastAPI may allow browser origins for local web dev. **React Native is not a browser** — CORS does not apply, but the device must still reach the host and port.

## Troubleshooting

- **HTTP 500** — server-side failure in `process_receipt` (model, memory, unexpected output). Body is often JSON `{"detail":"OCR processing failed: …"}`; the app surfaces that string when possible.
- **HTTP 400** (“valid image”) — empty or undecodable upload; confirm multipart field name **`file`** and that bytes are JPEG/PNG.

## Next

[Performance](./performance.md) — UI and JS-thread checklist for heavy screens.
