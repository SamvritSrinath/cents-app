# Receipt OCR service (mobile)

The Cents app sends receipt photos to the same **PaddleOCR FastAPI** service used by the expensely web app.

## Configure the app

1. Copy [`.env.example`](../.env.example) to `.env.local` if needed.
2. Set **`EXPO_PUBLIC_OCR_API_URL`** to the **base URL** of the service (no trailing slash). The client calls `POST {EXPO_PUBLIC_OCR_API_URL}/ocr` with multipart field **`file`**.

### Local development URLs

| Client | Typical base URL |
|--------|-------------------|
| iOS Simulator | `http://127.0.0.1:8000` |
| Android Emulator (host OCR) | `http://10.0.2.2:8000` |
| Physical device | HTTPS URL to a machine or cloud the phone can reach (e.g. tunnel or deployed service) |

[`app.json`](../app.json) sets **`android.usesCleartextTraffic`: true** so **HTTP** works for local dev. For production builds, prefer **HTTPS** and consider turning cleartext off.

## Run the service (source of truth)

Service code lives in the **expensely** repo: `expensely/ocr-service/`.

```bash
cd /path/to/expensely/ocr-service
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

See `expensely/ocr-service/README.md` for the API contract, `curl` examples, and deployment notes. Docker/compose files may be restored there for repeatable images; Paddle wheels are **platform-specific** (Linux x86_64 is the common cloud target).

## Security

The historical web client calls **`/ocr` without authentication**. For any shared or production deployment, add **API keys**, **mTLS**, or a **gateway** in front of the service and send the secret from the app via env (e.g. a server-issued token or Supabase Edge Function proxy) rather than exposing an open OCR endpoint.

## CORS

The FastAPI app allows browser origins (e.g. localhost for Next.js). **React Native does not enforce browser CORS**; mobile clients still need a **reachable** OCR URL.

## Troubleshooting `OCR failed (500)`

HTTP **500** means the service threw while handling the image (see `process_receipt` in `expensely/ocr-service/main.py`): PaddleOCR crash, out-of-memory on small hosts (e.g. HF Spaces cold start), or an unexpected model output shape. The response body is usually JSON `{"detail":"OCR processing failed: …"}`; the app parses that string and shows it in the error UI.

**400** with “valid image” means the upload was empty or not decodable as JPEG/PNG (wrong field name, corrupt file, etc.). The service validates with **PIL after read**, not only `Content-Type`, so React Native multipart uploads are accepted even if the part MIME type is missing.
