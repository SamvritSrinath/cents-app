# Cents Mobile App - PR Roadmap

**Version**: 1.0  
**Last Updated**: 2024-12-18  
**Repository**: `expensely-mobile` (separate repo)

---

## Overview

This document outlines the Pull Request roadmap for building the Cents mobile app. Each PR is scoped to be reviewable (~200-400 lines), testable independently, and merge-ready.

---

## Phase 0: Project Foundation

### PR #1: Initialize Project
**Branch**: `chore/init-project`  
**Size**: Small  
**Blocked by**: None

```bash
# What to do
npx create-expo-app@latest expensely-mobile --template expo-template-blank-typescript
cd expensely-mobile
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

**Changes**:
- Expo project with TypeScript
- Expo Router configured
- Basic `app/_layout.tsx`
- `app.json` with app name, slug, icons placeholders

**Testing**: `npx expo start` launches successfully

---

### PR #2: Configure Supabase Client
**Branch**: `feat/supabase-setup`  
**Size**: Small  
**Blocked by**: PR #1

**Changes**:
- Install `@supabase/supabase-js`, `expo-secure-store`
- Create `lib/supabase.ts` with SecureStore adapter
- Create `.env.example` with placeholder vars
- Add `.env.local` to `.gitignore`

**Files**:
```
lib/
└── supabase.ts          # Client configuration

.env.example             # Template for env vars
```

**Testing**: Can import client, connection doesn't error

---

### PR #3: Design System & Theme
**Branch**: `feat/design-system`  
**Size**: Small  
**Blocked by**: PR #1

**Changes**:
- Create `theme/colors.ts` (matching web app)
- Create `theme/typography.ts`
- Create `theme/spacing.ts`
- Optional: Set up React Native Paper theme

**Files**:
```
theme/
├── colors.ts
├── typography.ts
├── spacing.ts
└── index.ts
```

**Testing**: Theme tokens match web app design

---

### PR #4: Copy Shared Code from Web
**Branch**: `feat/shared-code`  
**Size**: Small  
**Blocked by**: PR #1

**What to copy from `expensely` web repo**:
- `src/types/database.ts` → `types/database.ts`
- `src/lib/receiptParser.ts` → `lib/receiptParser.ts`
- `src/lib/utils.ts` (relevant parts) → `lib/utils.ts`

**Changes**:
- Copy and adapt types (remove Next.js specific if any)
- Ensure TypeScript compiles

**Testing**: `npx tsc --noEmit` passes

---

### PR #5: ESLint, Prettier, CI Setup
**Branch**: `chore/lint-ci`  
**Size**: Small  
**Blocked by**: PR #1

**Changes**:
- Configure ESLint for React Native
- Configure Prettier
- Create `.github/workflows/ci.yml` (lint + typecheck)

**Files**:
```
.eslintrc.js
.prettierrc
.github/
└── workflows/
    └── ci.yml
```

**Testing**: `npm run lint` passes, CI runs on push

---

## Phase 1: Authentication

### PR #6: Auth Context & Hooks
**Branch**: `feat/auth-context`  
**Size**: Medium  
**Blocked by**: PR #2

**Changes**:
- Create `contexts/AuthContext.tsx`
- Implement `useAuth()` hook
- Handle session persistence with SecureStore
- Handle auth state changes

**Files**:
```
contexts/
└── AuthContext.tsx

hooks/
└── useAuth.ts (optional, can be in context)
```

**Testing**: Manual - auth state persists across reload

---

### PR #7: Login Screen UI
**Branch**: `feat/login-screen`  
**Size**: Medium  
**Blocked by**: PR #3, PR #6

**Changes**:
- Create `app/(auth)/login.tsx`
- Email/password inputs
- Sign in button with loading state
- Error message display
- Link to signup

**Testing**: Can enter credentials, see loading state

---

### PR #8: Signup Screen UI
**Branch**: `feat/signup-screen`  
**Size**: Medium  
**Blocked by**: PR #7

**Changes**:
- Create `app/(auth)/signup.tsx`
- Email/password/confirm password inputs
- Sign up button
- Error handling
- Link back to login

**Testing**: Can create account (with real Supabase)

---

### PR #9: Protected Routes
**Branch**: `feat/protected-routes`  
**Size**: Small  
**Blocked by**: PR #6

**Changes**:
- Create `app/(tabs)/_layout.tsx` with auth check
- Redirect to login if not authenticated
- Show loading state while checking auth

**Testing**: Unauthenticated users redirected to login

---

## Phase 1B: Core Expense CRUD

### PR #10: Tab Navigator
**Branch**: `feat/tab-navigation`  
**Size**: Small  
**Blocked by**: PR #9

**Changes**:
- Configure tab bar in `app/(tabs)/_layout.tsx`
- Dashboard, Expenses, Budgets, Settings tabs
- Icons from Lucide React Native

**Testing**: Can navigate between tabs

---

### PR #11: Expense List Screen
**Branch**: `feat/expense-list`  
**Size**: Medium  
**Blocked by**: PR #10, PR #4

**Changes**:
- Create `app/(tabs)/expenses.tsx`
- Create `hooks/useExpenses.ts` with React Query
- Create `components/ExpenseCard.tsx`
- Implement FlatList with data

**Testing**: Displays expenses from Supabase

---

### PR #12: Expense List Pagination
**Branch**: `feat/expense-pagination`  
**Size**: Small  
**Blocked by**: PR #11

**Changes**:
- Convert to `useInfiniteQuery`
- Add `onEndReached` handler
- Loading indicator at bottom

**Testing**: Scroll to load more expenses

---

### PR #13: Create Expense Screen
**Branch**: `feat/create-expense`  
**Size**: Large  
**Blocked by**: PR #11

**Changes**:
- Create `app/expenses/create.tsx`
- Amount input with currency formatting
- Date picker
- Category picker (modal)
- Merchant input
- Save mutation

**Testing**: Can create expense, appears in list

---

### PR #14: Edit & Delete Expense
**Branch**: `feat/edit-delete-expense`  
**Size**: Medium  
**Blocked by**: PR #13

**Changes**:
- Create `app/expenses/[id].tsx` (detail view)
- Edit mode toggle
- Delete with confirmation modal
- Update and delete mutations

**Testing**: Can edit amount, can delete expense

---

## Phase 2: OCR Integration

### PR #15: Camera Setup
**Branch**: `feat/camera-setup`  
**Size**: Medium  
**Blocked by**: PR #13

**Changes**:
- Install `expo-camera`, `expo-image-picker`
- Create `app/scan/index.tsx`
- Camera permission request
- Capture photo functionality
- Photo preview

**Testing**: Can take photo, see preview

---

### PR #16: Image Cropping
**Branch**: `feat/image-crop`  
**Size**: Medium  
**Blocked by**: PR #15

**Changes**:
- Install image cropping library
- Add crop interface after capture
- Compress image before processing

**Testing**: Can crop receipt image

---

### PR #17: OCR Integration (ML Kit)
**Branch**: `feat/ocr-mlkit`  
**Size**: Large  
**Blocked by**: PR #15, PR #4

**Changes**:
- Install `react-native-mlkit-ocr` (or custom native module)
- Create `services/ocr/index.ts`
- Process captured image
- Parse text with `receiptParser.ts`

**Native work required** - may need `npx expo run:*`

**Testing**: Scan receipt, see extracted text

---

### PR #18: OCR Result Review
**Branch**: `feat/ocr-review`  
**Size**: Medium  
**Blocked by**: PR #17

**Changes**:
- Create `app/scan/review.tsx`
- Pre-filled form with OCR results
- Editable fields
- Confidence indicators
- Save as expense

**Testing**: OCR data pre-fills form, can edit and save

---

## Phase 3: Dashboard & Features

### PR #19: Dashboard Layout
**Branch**: `feat/dashboard-layout`  
**Size**: Medium  
**Blocked by**: PR #10

**Changes**:
- Create `app/(tabs)/index.tsx` (dashboard)
- Create `hooks/useDashboardData.ts`
- Spending summary card
- Recent transactions section

**Testing**: Shows monthly spending total

---

### PR #20: Dashboard Charts
**Branch**: `feat/dashboard-charts`  
**Size**: Medium  
**Blocked by**: PR #19

**Changes**:
- Install Victory Native
- Category breakdown chart
- Monthly spending trend chart

**Testing**: Charts render with real data

---

### PR #21: Budget Management
**Branch**: `feat/budgets`  
**Size**: Medium  
**Blocked by**: PR #10

**Changes**:
- Create `app/(tabs)/budgets.tsx`
- Create `hooks/useBudgets.ts`
- Budget list with progress bars
- Create/edit budget modal

**Testing**: Can create budget, see progress

---

### PR #22: Offline Queue
**Branch**: `feat/offline-support`  
**Size**: Medium  
**Blocked by**: PR #13

**Changes**:
- Create `hooks/useNetworkStatus.ts`
- Create `services/offlineQueue.ts`
- Queue mutations when offline
- Sync indicator in UI

**Testing**: Add expense offline, syncs when online

---

### PR #23: Settings Screen
**Branch**: `feat/settings`  
**Size**: Small  
**Blocked by**: PR #10

**Changes**:
- Create `app/(tabs)/settings.tsx`
- Profile section
- Logout button
- App version info

**Testing**: Can log out

---

## Phase 4: Polish & Release

### PR #24: Unit Tests
**Branch**: `test/unit-tests`  
**Size**: Medium  
**Blocked by**: PR #4

**Changes**:
- Configure Jest
- Tests for `receiptParser.ts`
- Tests for utility functions
- CI runs tests

**Testing**: `npm test` passes with coverage

---

### PR #25: Component Tests
**Branch**: `test/component-tests`  
**Size**: Medium  
**Blocked by**: PR #11

**Changes**:
- Tests for ExpenseCard
- Tests for forms
- Tests for modals

**Testing**: Component tests pass

---

### PR #26: App Store Assets
**Branch**: `chore/app-store-assets`  
**Size**: Small  
**Blocked by**: PR #23

**Changes**:
- App icon (1024x1024)
- Splash screen
- Configure in `app.json`

**Testing**: App launches with new icon/splash

---

### PR #27: Production Build Config
**Branch**: `chore/eas-production`  
**Size**: Small  
**Blocked by**: PR #26

**Changes**:
- Configure `eas.json` production profile
- Set up EAS Submit
- Final environment variables

**Testing**: Production build succeeds

---

## PR Dependency Graph

```
PR #1 (Init)
├── PR #2 (Supabase) ─── PR #6 (Auth Context) ─┬─ PR #7 (Login) ─── PR #8 (Signup)
├── PR #3 (Theme) ──────────────────────────────┤
├── PR #4 (Shared Code) ────────────────────────┴─ PR #9 (Protected Routes)
└── PR #5 (CI)                                           │
                                                         ▼
                                                  PR #10 (Tabs)
                                                         │
                  ┌──────────────────────────────────────┼──────────────────┐
                  ▼                                      ▼                  ▼
           PR #11 (List)                          PR #19 (Dashboard)   PR #21 (Budgets)
                  │                                      │
                  ▼                                      ▼
           PR #12 (Pagination)                    PR #20 (Charts)
                  │
                  ▼
           PR #13 (Create) ───────────────────────────────────────> PR #22 (Offline)
                  │
           ┌──────┴──────┐
           ▼             ▼
    PR #14 (Edit)   PR #15 (Camera)
                         │
                         ▼
                   PR #16 (Crop)
                         │
                         ▼
                   PR #17 (OCR)
                         │
                         ▼
                   PR #18 (Review)
```

---

## Milestones

### Milestone 1: Auth & Navigation (PRs #1-10)
- [ ] Project initialized
- [ ] User can sign up and log in
- [ ] Protected tab navigation works

### Milestone 2: Expense CRUD (PRs #11-14)
- [ ] User can view expenses
- [ ] User can create/edit/delete expenses

### Milestone 3: OCR Scanning (PRs #15-18)
- [ ] User can scan receipt
- [ ] OCR extracts text on-device
- [ ] Data pre-fills expense form

### Milestone 4: Dashboard (PRs #19-21)
- [ ] User sees spending summary
- [ ] Charts display correctly
- [ ] Budgets can be tracked

### Milestone 5: Polish (PRs #22-27)
- [ ] Offline support works
- [ ] Settings complete
- [ ] Tests passing
- [ ] Ready for App Store

---

## Quick Reference: PR Sizes

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| Small | < 200 | 15 min |
| Medium | 200-400 | 30 min |
| Large | 400-800 | 1 hour |

---

## Notes

- Each PR should be independently testable
- Don't merge PRs that break the build
- PRs #15-18 (OCR) require local native builds
- Save EAS builds for integration testing after major milestones
