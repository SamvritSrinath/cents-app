# Performance (baseline and audit)

This document captures a lightweight performance baseline for Cents after the **0.5.0** release and a checklist for deeper profiling later.

## Baseline (0.5.0)

- **Data:** React Query caches dashboard and category queries with tuned `staleTime` values in hooks (`useDashboard`, `useCategories`, etc.).
- **Lists:** Expense lists should use stable keys and avoid inline heavy work in `renderItem` where possible.
- **Forms:** [`ExpenseForm`](../components/ExpenseForm.tsx) is one of the heavier screens (animations, line items, pickers); prefer memoized children if profiling shows unnecessary re-renders.
- **Charts:** Gifted Charts usage on the home/dashboard path; watch JS thread time on low-end Android when many points are shown.

## Audit checklist (next pass)

1. Enable React Native **Performance Monitor** (dev menu) on a physical device while scrolling expenses and opening the expense form.
2. Use **React DevTools** (or LogBox) to note components that re-render on every keystroke or query invalidation.
3. Confirm list screens use **`FlashList`** or **`FlatList`** with `keyExtractor` and appropriate `windowSize` / `maxToRenderPerBatch` if lists grow large.
4. Review **image pipeline** for receipts (resize/compress before upload if not already capped).
5. Record findings and concrete changes under a dated subsection here or in a PR description.

## Typography note (0.5.0)

[`theme/typography.ts`](../theme/typography.ts) was slightly reduced (about 1–2px per scale) to improve density on small phones. Revisit if accessibility reviews request larger dynamic type support.
