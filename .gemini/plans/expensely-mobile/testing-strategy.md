# Cents Mobile App - Testing Strategy

**Version**: 1.0  
**Last Updated**: 2024-12-18

---

## Overview

This document outlines the testing strategy for the Cents mobile app, emphasizing **local testing** to conserve EAS build credits while maintaining high code quality.

---

## Testing Pyramid

```
                    ┌───────────────┐
                    │     E2E       │  10% - Critical flows only
                    │    (Detox)    │
                    ├───────────────┤
                    │  Integration  │  20% - API, navigation, stores
                    │   (Jest+MSW)  │
                    ├───────────────┤
                    │   Component   │  30% - UI components
                    │ (RTL Native)  │
                    ├───────────────┤
                    │     Unit      │  40% - Business logic, utils
                    │    (Jest)     │
                    └───────────────┘
```

---

## Test Categories

### 1. Unit Tests (40%)

**Purpose**: Test business logic, utilities, and pure functions in isolation.

**Tools**:
- Jest
- TypeScript

**What to Test**:
- Receipt parser (`receiptParser.ts`)
- Utility functions
- Data transformations
- Validation logic
- Currency formatting

**Example**:

```typescript
// __tests__/lib/receiptParser.test.ts
import { parseReceipt, validateReceipt } from '@/lib/receiptParser';

describe('parseReceipt', () => {
  describe('merchant extraction', () => {
    it('extracts known merchant from header', () => {
      const text = 'COSTCO WHOLESALE\n123 Main St\nTOTAL $97.18';
      const result = parseReceipt(text);
      expect(result.merchant).toBe('Costco');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('handles case variations', () => {
      const text = 'target\n$42.50';
      expect(parseReceipt(text).merchant).toBe('Target');
    });

    it('falls back to first line for unknown merchant', () => {
      const text = 'LOCAL DELI\nTOTAL $15.00';
      expect(parseReceipt(text).merchant).toBe('LOCAL DELI');
    });
  });

  describe('total extraction', () => {
    it('extracts total with dollar sign', () => {
      const text = 'TOTAL $97.18';
      expect(parseReceipt(text).total).toBe(97.18);
    });

    it('extracts total without dollar sign', () => {
      const text = 'TOTAL: 42.50';
      expect(parseReceipt(text).total).toBe(42.50);
    });

    it('handles comma-separated thousands', () => {
      const text = 'TOTAL $1,234.56';
      expect(parseReceipt(text).total).toBe(1234.56);
    });

    it('picks largest amount as fallback', () => {
      const text = 'Item 1 5.00\nItem 2 10.00\n15.00';
      expect(parseReceipt(text).total).toBe(15.00);
    });
  });

  describe('date extraction', () => {
    it('parses MM/DD/YYYY format', () => {
      const text = '12/25/2024';
      expect(parseReceipt(text).date).toBe('2024-12-25');
    });

    it('parses MM-DD-YY format', () => {
      const text = '12-25-24';
      expect(parseReceipt(text).date).toBe('2024-12-25');
    });

    it('rejects dates outside valid range', () => {
      const text = '01/01/2015'; // Too old
      expect(parseReceipt(text).date).toBeNull();
    });
  });
});

describe('validateReceipt', () => {
  it('returns no errors for valid receipt', () => {
    const receipt = {
      merchant: 'Target',
      total: 42.50,
      date: '2024-12-18',
      currency: 'USD',
      items: [],
      rawText: 'test',
      confidence: 0.8,
    };
    expect(validateReceipt(receipt)).toHaveLength(0);
  });

  it('returns error for missing total', () => {
    const receipt = {
      merchant: 'Target',
      total: null,
      date: '2024-12-18',
      currency: 'USD',
      items: [],
      rawText: 'test',
      confidence: 0.8,
    };
    expect(validateReceipt(receipt)).toContain('Could not extract total amount');
  });
});
```

**Coverage Target**: 90% for business logic

---

### 2. Component Tests (30%)

**Purpose**: Test UI components render correctly and respond to interactions.

**Tools**:
- Jest
- @testing-library/react-native

**What to Test**:
- Component rendering
- User interactions (tap, type)
- Conditional rendering
- Loading/error states
- Accessibility labels

**Example**:

```typescript
// __tests__/components/ExpenseCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ExpenseCard } from '@/components/ExpenseCard';

const mockExpense = {
  id: '1',
  amount: 42.50,
  currency: 'USD',
  merchant: 'Target',
  category: { name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
  expense_date: '2024-12-18',
  description: 'Holiday shopping',
};

describe('ExpenseCard', () => {
  it('renders expense details', () => {
    render(<ExpenseCard expense={mockExpense} />);
    
    expect(screen.getByText('$42.50')).toBeOnTheScreen();
    expect(screen.getByText('Target')).toBeOnTheScreen();
    expect(screen.getByText('Shopping')).toBeOnTheScreen();
  });

  it('formats date correctly', () => {
    render(<ExpenseCard expense={mockExpense} />);
    
    expect(screen.getByText('Dec 18, 2024')).toBeOnTheScreen();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ExpenseCard expense={mockExpense} onPress={onPress} />);
    
    fireEvent.press(screen.getByTestId('expense-card'));
    expect(onPress).toHaveBeenCalledWith(mockExpense);
  });

  it('shows category icon', () => {
    render(<ExpenseCard expense={mockExpense} />);
    
    expect(screen.getByText('🛍️')).toBeOnTheScreen();
  });

  it('handles missing merchant gracefully', () => {
    const expenseNoMerchant = { ...mockExpense, merchant: null };
    render(<ExpenseCard expense={expenseNoMerchant} />);
    
    expect(screen.getByText('Unknown Merchant')).toBeOnTheScreen();
  });
});
```

```typescript
// __tests__/components/AmountInput.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AmountInput } from '@/components/AmountInput';

describe('AmountInput', () => {
  it('formats input as currency', () => {
    const onChange = jest.fn();
    render(<AmountInput value="" onChangeValue={onChange} />);
    
    fireEvent.changeText(screen.getByTestId('amount-input'), '4250');
    expect(onChange).toHaveBeenCalledWith('42.50');
  });

  it('rejects non-numeric input', () => {
    const onChange = jest.fn();
    render(<AmountInput value="10.00" onChangeValue={onChange} />);
    
    fireEvent.changeText(screen.getByTestId('amount-input'), 'abc');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows currency symbol', () => {
    render(<AmountInput value="42.50" currency="USD" onChangeValue={() => {}} />);
    
    expect(screen.getByText('$')).toBeOnTheScreen();
  });

  it('has accessible label', () => {
    render(<AmountInput value="" onChangeValue={() => {}} />);
    
    expect(screen.getByLabelText('Amount')).toBeOnTheScreen();
  });
});
```

**Coverage Target**: 80% for components

---

### 3. Integration Tests (20%)

**Purpose**: Test how components work together, including API calls and navigation.

**Tools**:
- Jest
- @testing-library/react-native
- MSW (Mock Service Worker) for API mocking
- React Navigation testing utilities

**What to Test**:
- Screen-level interactions
- API request/response handling
- Navigation flows
- State management integration
- Form submissions

**Example**:

```typescript
// __tests__/integration/createExpense.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateExpenseScreen } from '@/app/expenses/create';
import { server } from '../mocks/server';
import { rest } from 'msw';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderScreen = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <CreateExpenseScreen />
      </NavigationContainer>
    </QueryClientProvider>
  );
};

describe('CreateExpenseScreen', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('creates expense successfully', async () => {
    renderScreen();
    
    // Fill form
    fireEvent.changeText(screen.getByTestId('amount-input'), '42.50');
    fireEvent.press(screen.getByTestId('category-picker'));
    fireEvent.press(screen.getByText('Groceries'));
    fireEvent.changeText(screen.getByTestId('merchant-input'), "Trader Joe's");
    
    // Submit
    fireEvent.press(screen.getByTestId('save-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Expense saved!')).toBeOnTheScreen();
    });
  });

  it('shows validation error for missing amount', async () => {
    renderScreen();
    
    fireEvent.press(screen.getByTestId('save-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Amount is required')).toBeOnTheScreen();
    });
  });

  it('handles API error gracefully', async () => {
    server.use(
      rest.post('*/rest/v1/expenses', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    renderScreen();
    
    fireEvent.changeText(screen.getByTestId('amount-input'), '42.50');
    fireEvent.press(screen.getByTestId('save-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save expense')).toBeOnTheScreen();
    });
  });
});
```

**MSW Setup**:

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('*/rest/v1/expenses', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          amount: 42.50,
          merchant: 'Target',
          expense_date: '2024-12-18',
          category: { name: 'Shopping', icon: '🛍️' },
        },
      ])
    );
  }),

  rest.post('*/rest/v1/expenses', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        ...req.body,
        created_at: new Date().toISOString(),
      })
    );
  }),

  rest.get('*/rest/v1/categories', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'Groceries', icon: '🛒' },
        { id: '2', name: 'Shopping', icon: '🛍️' },
        { id: '3', name: 'Dining', icon: '🍔' },
      ])
    );
  }),
];
```

**Coverage Target**: 70% for screens

---

### 4. End-to-End Tests (10%)

**Purpose**: Test complete user journeys on real devices/simulators.

**Tools**:
- Detox (iOS/Android)
- Alternative: Maestro (simpler, YAML-based)

**What to Test**:
- Critical user flows only
- Authentication
- Core CRUD operations
- OCR scanning flow

**Detox Example**:

```typescript
// e2e/auth.e2e.ts
describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Invalid login credentials'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // Login first
    await loginAsTestUser();
    
    // Navigate to settings and logout
    await element(by.id('tab-settings')).tap();
    await element(by.id('logout-button')).tap();
    await element(by.text('Confirm')).tap();
    
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
```

```typescript
// e2e/expenses.e2e.ts
describe('Expense Management', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginAsTestUser();
  });

  it('should create an expense manually', async () => {
    await element(by.id('tab-expenses')).tap();
    await element(by.id('add-expense-fab')).tap();
    
    await element(by.id('amount-input')).typeText('42.50');
    await element(by.id('category-picker')).tap();
    await element(by.text('Groceries')).tap();
    await element(by.id('merchant-input')).typeText("Trader Joe's");
    await element(by.id('save-button')).tap();
    
    await waitFor(element(by.text('$42.50')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should edit an existing expense', async () => {
    await element(by.text('$42.50')).tap();
    await element(by.id('edit-button')).tap();
    
    await element(by.id('amount-input')).clearText();
    await element(by.id('amount-input')).typeText('45.00');
    await element(by.id('save-button')).tap();
    
    await expect(element(by.text('$45.00'))).toBeVisible();
  });

  it('should delete an expense', async () => {
    await element(by.text('$45.00')).tap();
    await element(by.id('delete-button')).tap();
    await element(by.text('Delete')).tap();
    
    await expect(element(by.text('$45.00'))).not.toBeVisible();
  });
});
```

**Maestro Alternative** (Simpler YAML-based):

```yaml
# e2e/flows/create-expense.yaml
appId: com.yourname.cents

---
- launchApp

# Login
- tapOn:
    id: "email-input"
- inputText: "test@example.com"
- tapOn:
    id: "password-input"  
- inputText: "password123"
- tapOn:
    id: "login-button"

# Wait for dashboard
- assertVisible:
    id: "dashboard-screen"

# Create expense
- tapOn:
    id: "add-expense-fab"
- tapOn:
    id: "amount-input"
- inputText: "42.50"
- tapOn:
    id: "category-picker"
- tapOn: "Groceries"
- tapOn:
    id: "save-button"

# Verify
- assertVisible: "$42.50"
```

**Coverage Target**: Critical paths only (login, create expense, OCR flow)

---

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern='__tests__/(lib|utils)'",
    "test:components": "jest --testPathPattern='__tests__/components'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e:build:ios": "detox build --configuration ios.sim.debug",
    "test:e2e:build:android": "detox build --configuration android.emu.debug"
  }
}
```

---

## Local Testing Workflow (Save EAS Builds!)

### Daily Development Testing

```bash
# 1. Run all unit/component tests locally (fast, no build needed)
npm test

# 2. Start Expo with simulator
npx expo start --ios   # or --android

# 3. Manual testing in simulator
# - Test new features
# - Verify UI changes
# - Check navigation flows
```

### Pre-PR Testing

```bash
# 1. Full test suite with coverage
npm run test:coverage

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Build check (local, no EAS)
npx expo export --platform ios  # Verifies bundling works
```

### OCR Testing (Requires Device)

For OCR testing, use local development builds:

```bash
# Build once for your development device
npx expo run:ios --device   # Real iPhone
npx expo run:android        # Real Android device

# Then iterate with Expo Go for non-native changes
```

---

## CI/CD Testing Pipeline

```yaml
# .github/workflows/mobile-test.yml
name: Mobile Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/mobile/**'
      - 'packages/shared/**'
  pull_request:
    paths:
      - 'apps/mobile/**'
      - 'packages/shared/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/mobile
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/mobile/coverage/lcov.info
          flags: mobile

  lint-and-types:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/mobile
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  # E2E only runs on main (expensive)
  e2e-tests:
    needs: [unit-tests, lint-and-types]
    if: github.ref == 'refs/heads/main'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd apps/mobile
          npm ci
          
      - name: Build Detox
        run: |
          cd apps/mobile
          npm run test:e2e:build:ios
          
      - name: Run E2E tests
        run: |
          cd apps/mobile
          npm run test:e2e:ios
```

---

## Test Data Management

### Test Fixtures

```typescript
// __tests__/fixtures/expenses.ts
export const mockExpenses = [
  {
    id: '1',
    user_id: 'test-user-id',
    amount: 42.50,
    currency: 'USD',
    merchant: 'Target',
    category_id: 'cat-1',
    expense_date: '2024-12-18',
    created_at: '2024-12-18T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'test-user-id',
    amount: 97.18,
    currency: 'USD',
    merchant: 'Costco',
    category_id: 'cat-2',
    expense_date: '2024-12-17',
    created_at: '2024-12-17T15:30:00Z',
  },
];

export const mockCategories = [
  { id: 'cat-1', name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
  { id: 'cat-2', name: 'Groceries', icon: '🛒', color: '#10b981' },
  { id: 'cat-3', name: 'Dining', icon: '🍔', color: '#ef4444' },
];

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
};
```

### Receipt OCR Test Cases

```typescript
// __tests__/fixtures/receipts.ts
export const receiptTestCases = [
  {
    name: 'Standard Costco receipt',
    input: `COSTCO WHOLESALE
123 Main Street
Anytown, CA 90210

12/18/24 14:32

ITEM 1                    12.99
ITEM 2                     5.49
ITEM 3                    24.99

SUBTOTAL                  43.47
TAX                        3.71
TOTAL                    $47.18

VISA ****1234            47.18`,
    expected: {
      merchant: 'Costco',
      total: 47.18,
      date: '2024-12-18',
      itemCount: 3,
    },
  },
  {
    name: 'Target with Target Circle branding',
    input: `Target
Target Circle Member

GROCERY
MILK 2%                    4.29
BREAD WHEAT                3.49

SUBTOTAL                   7.78
TAX                        0.62
TOTAL                     $8.40`,
    expected: {
      merchant: 'Target',
      total: 8.40,
      itemCount: 2,
    },
  },
  {
    name: 'Minimal receipt',
    input: `LOCAL STORE
TOTAL $15.00
01/15/2024`,
    expected: {
      merchant: 'LOCAL STORE',
      total: 15.00,
      date: '2024-01-15',
    },
  },
];
```

---

## Performance Testing

### Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| App launch time | < 2s | Flipper / manual |
| Screen render time | < 100ms | React DevTools |
| List scroll FPS | 60fps | React DevTools |
| Memory usage | < 200MB | Xcode Instruments |
| Bundle size | < 50MB | EAS build output |

### Performance Test Script

```typescript
// __tests__/performance/listPerformance.test.tsx
import { performance } from 'perf_hooks';
import { render } from '@testing-library/react-native';
import { ExpenseList } from '@/components/ExpenseList';
import { generateMockExpenses } from '../fixtures/generators';

describe('ExpenseList Performance', () => {
  it('renders 100 items in under 200ms', () => {
    const expenses = generateMockExpenses(100);
    
    const start = performance.now();
    render(<ExpenseList expenses={expenses} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  it('renders 1000 items in under 500ms', () => {
    const expenses = generateMockExpenses(1000);
    
    const start = performance.now();
    render(<ExpenseList expenses={expenses} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });
});
```

---

## Accessibility Testing

### Automated Checks

```typescript
// __tests__/accessibility/a11y.test.tsx
import { render } from '@testing-library/react-native';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button has no accessibility violations', async () => {
    const { container } = render(
      <Button onPress={() => {}}>Click me</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Accessibility Checklist

- [ ] All interactive elements have accessible labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announces content correctly
- [ ] Touch targets are at least 44x44 points
- [ ] Focus order is logical
- [ ] Dynamic content updates are announced

---

## Summary

| Test Type | Tools | Run Frequency | CI |
|-----------|-------|---------------|-----|
| Unit | Jest | Every save | ✅ |
| Component | Jest + RTL Native | Every save | ✅ |
| Integration | Jest + MSW | Pre-commit | ✅ |
| E2E | Detox/Maestro | Pre-merge to main | ✅ (main only) |
| Performance | Manual + Flipper | Weekly | ❌ |
| Accessibility | Manual + a11y tools | Per feature | ❌ |

### Coverage Goals

| Category | Target |
|----------|--------|
| Business logic | 90% |
| Components | 80% |
| Screens | 70% |
| Overall | 75% |
