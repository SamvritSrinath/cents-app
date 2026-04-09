---
trigger: model_decision
description: Use this rule when the user requests a new feature, a significant refactor, or when creating a new file from scratch. Do not use for minor bug fixes or one-line changes.
---

# Project Governance & Documentation

## Code Ownership
- **Header Comments:** Every new file must start with a JSDoc block defining:
  - `@module`: What this file does.
  - `@owner`: The primary logical domain (e.g., "Authentication", "Profile").
  - `@updates`: A brief log of the last major change.

## The "Living README" Rule
- **Iterative Updates:** If a change modifies the project structure, adds a new dependency, or changes how the app is run, you MUST output a revised section for `README.md`.
- **Environment Variables:** If new secrets are used, update `.env.example` immediately.

## Testing Mandate
- **Zero Bloat:** Tests must be co-located with components (e.g., `MyComponent.test.tsx` next to `MyComponent.tsx`).
- **Coverage:** No feature is "done" until a test file exists that passes a "render" check and one "interaction" check.