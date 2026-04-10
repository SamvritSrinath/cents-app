---
trigger: glob
globs: **/*.{ts,tsx,js,jsx}
---

# Code Quality & Performance

## Production Readiness
- **Strict Typing:** No `any`. Define interfaces for all Props, State, and API Responses.
- **Error Boundaries:** Every major feature screen must have an Error Boundary or `try/catch` block for async operations.
- **Clean Up:** strictly remove console logs and unused imports before final output.

## React Native Performance
- **Memoization:** Aggressively use `useCallback` for functions passed as props and `useMemo` for heavy calculations.
- **List Virtualization:**
  - NEVER map items inside a ScrollView.
  - ALWAYS use `FlashList` (Shopify) or `FlatList` for lists.
- **Image Optimization:** Use `<Image />` from `expo-image` with `cachePolicy="memory-disk"` for list items.