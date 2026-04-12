---
title: Performance
description: Baseline expectations and a practical profiling checklist for Cents on Android.
---

# Performance

## Why track performance

Expense apps are used in quick sessions. Jank during scroll or form entry reads as “slow app,” not “heavy chart.” This page captures **what we already optimize for** and **what to measure next**.

## Baseline (0.5.0+)

- **Data:** React Query caches dashboard and category queries with tuned `staleTime` in `hooks/` (`useDashboard`, `useCategories`, and related hooks).
- **Lists:** Expense lists use stable keys; avoid heavy per-row work inside `renderItem`.
- **Forms:** `components/ExpenseForm.tsx` is relatively heavy (animations, line items, pickers); memoize children if profiling shows avoidable re-renders.
- **Charts:** Gifted Charts on dashboard paths — watch JS thread time on low-end Android with many points.

## Audit checklist (next pass)

1. Enable React Native **Performance Monitor** (dev menu) on a physical device while scrolling expenses and editing the expense form.
2. Use **React DevTools** / LogBox to spot components re-rendering on every keystroke or invalidation.
3. For large lists, confirm **`FlatList`** (or `FlashList` if adopted) uses a stable `keyExtractor` and sensible `windowSize` / `maxToRenderPerBatch`.
4. Review the **receipt image** pipeline — resize or compress before upload if payloads are large.
5. Record findings in PR descriptions or a dated subsection here.

## Typography note

`theme/typography.ts` was slightly tightened for density on small phones. Revisit if accessibility reviews require stronger dynamic type support.

## Next

[CI & local checks](./ci-and-quality.md) — how we enforce quality in GitHub Actions.
