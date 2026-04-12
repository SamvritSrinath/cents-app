---
title: API reference and TSDoc
description: Where the TypeDoc site lives and how we document the codebase.
---

# API reference and documentation standards

## Two outputs, one source of truth

| Output | Command | Where it shows up |
| --- | --- | --- |
| **TypeDoc HTML** (browse, search symbols) | `npm run docs:api:html` | Served at **`/api/`** next to the VitePress site — use the top nav **API (TypeDoc)** or open [`/api/index.html`](/api/index.html) |
| **Markdown** (PR review, diffs) | `npm run docs:api` | Committed under `docs/generated/api-md/`; CI fails if it drifts |

The guides you are reading now are **VitePress**. The API browser is **TypeDoc’s default HTML UI** — intentionally separate so symbol navigation and search stay first-class. You do **not** need the two to look identical; both should stay accurate.

## Local setup

```bash
npm run docs:dev
```

The dev script generates TypeDoc HTML once if `public/api/index.html` is missing, then starts VitePress. Use **`http://localhost:5173/cents-app/api/`** or **`…/api/index.html`**.

## Documenting code (TSDoc / JSDoc)

We treat **documentation as part of the API contract** for anything exported from `lib/`, `hooks/`, and shared types.

- Use **`/** … */`** blocks on modules (file top), exported functions, interfaces, and non-obvious types.
- Prefer **`@param`**, **`@returns`**, and **`@throws`** when behavior, errors, or side effects are not obvious from types alone.
- Use **`@remarks`** for RLS assumptions, cache keys, invalidation rules, and env vars (`EXPO_PUBLIC_*`).
- Avoid nonstandard tags TypeDoc does not understand (they produce warnings in CI).

After changing documented surfaces:

```bash
npm run docs:api && npm run docs:api:html
```

Commit updates under `docs/generated/api-md/` for CI.

## Next

- [CI & local checks](./ci-and-quality.md)
