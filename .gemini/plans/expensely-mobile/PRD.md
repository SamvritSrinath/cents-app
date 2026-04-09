# Cents Mobile App - Product Requirements Document (PRD)

**Version**: 1.0  
**Last Updated**: 2024-12-18  
**Status**: Draft

---

## Executive Summary

Cents Mobile is a React Native / Expo companion app for the Cents expense tracker web app. It provides native mobile experiences for iOS and Android, including on-device receipt scanning using platform-native OCR (Apple Vision / Google ML Kit), offline-first data management, and seamless sync with the existing Supabase backend.

### Goals
- **Mobile-first expense entry**: Quick expense logging with receipt scanning
- **Privacy-preserving OCR**: All text recognition happens on-device
- **Seamless sync**: Share data with web app via existing Supabase backend
- **Native feel**: Platform-appropriate UI/UX for iOS and Android
- **Cost-efficient development**: Maximize local testing, minimize EAS builds

---

## User Stories

### Core User Stories (MVP)

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US1 | User | Sign in with my existing Cents account | I can access my expenses on mobile | P0 |
| US2 | User | See my expense history | I can review past spending on the go | P0 |
| US3 | User | Add an expense manually | I can log purchases quickly | P0 |
| US4 | User | Scan a receipt and extract data | I don't have to type expense details | P0 |
| US5 | User | Select a category for expenses | My spending is organized | P0 |
| US6 | User | View my dashboard summary | I understand my spending at a glance | P1 |
| US7 | User | Set and track budgets | I can control my spending | P1 |
| US8 | User | Work offline | I can add expenses without internet | P2 |
| US9 | User | Receive budget alerts | I know when I'm overspending | P2 |

### Future User Stories (Post-MVP)

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US10 | User | Export my data | I can use it in other apps | P3 |
| US11 | User | Use biometric auth | I can securely access my data faster | P3 |
| US12 | User | Share expenses with household | We can track family spending | P3 |
| US13 | User | Get spending insights | I understand my financial habits | P3 |

---

## Functional Requirements

### FR1: Authentication

| Requirement | Description |
|-------------|-------------|
| FR1.1 | Email/password login via Supabase Auth |
| FR1.2 | "Remember me" functionality with secure token storage |
| FR1.3 | Password reset flow |
| FR1.4 | Session persistence across app restarts |
| FR1.5 | Logout functionality |

### FR2: Expense Management

| Requirement | Description |
|-------------|-------------|
| FR2.1 | List expenses with infinite scroll |
| FR2.2 | Filter by date range, category, merchant |
| FR2.3 | Search expenses by text |
| FR2.4 | Create expense with: amount, date, category, merchant, notes |
| FR2.5 | Edit existing expenses |
| FR2.6 | Delete expenses with confirmation |
| FR2.7 | View expense details including receipt image |

### FR3: Receipt Scanning (On-Device OCR)

| Requirement | Description |
|-------------|-------------|
| FR3.1 | Camera capture for receipts |
| FR3.2 | Image picker for existing photos |
| FR3.3 | On-device OCR using platform APIs |
| FR3.4 | Extract: merchant, total, date, line items |
| FR3.5 | Pre-fill expense form with extracted data |
| FR3.6 | Allow user corrections before saving |
| FR3.7 | Store receipt image with expense |

### FR4: Categories

| Requirement | Description |
|-------------|-------------|
| FR4.1 | Display predefined categories |
| FR4.2 | Display user's custom categories |
| FR4.3 | Create custom categories |
| FR4.4 | Assign categories to expenses |

### FR5: Dashboard

| Requirement | Description |
|-------------|-------------|
| FR5.1 | Show total spending this month |
| FR5.2 | Show comparison to previous month |
| FR5.3 | Category-wise spending breakdown (pie/bar chart) |
| FR5.4 | Recent transactions list |
| FR5.5 | Budget progress indicators |

### FR6: Budgets

| Requirement | Description |
|-------------|-------------|
| FR6.1 | View current budgets by category |
| FR6.2 | Create new budgets |
| FR6.3 | Edit budget amounts |
| FR6.4 | Visual progress bars for budget utilization |
| FR6.5 | Highlight over-budget categories |

### FR7: Data Sync

| Requirement | Description |
|-------------|-------------|
| FR7.1 | Real-time sync with Supabase on connection |
| FR7.2 | Background sync on app resume |
| FR7.3 | Offline queue for expense creation |
| FR7.4 | Conflict resolution (last-write-wins) |
| FR7.5 | Sync status indicator |

---

## Non-Functional Requirements

### NFR1: Performance

| Requirement | Target |
|-------------|--------|
| Cold start time | < 2 seconds |
| Screen transitions | < 100ms |
| OCR processing time | < 3 seconds |
| API response handling | < 500ms perceived |
| App bundle size | < 50MB iOS, < 30MB Android |

### NFR2: Security

| Requirement | Description |
|-------------|-------------|
| NFR2.1 | Secure token storage (Keychain/Keystore) |
| NFR2.2 | HTTPS-only communication |
| NFR2.3 | No third-party analytics tracking |
| NFR2.4 | Minimal permissions (camera, storage for receipts) |
| NFR2.5 | Receipt images stored locally, not synced to cloud by default |

### NFR3: Reliability

| Requirement | Target |
|-------------|--------|
| Offline availability | Basic features work without internet |
| Data consistency | No data loss on network failures |
| Crash-free rate | > 99.5% |

### NFR4: Usability

| Requirement | Description |
|-------------|-------------|
| NFR4.1 | Dark mode default (match web app) |
| NFR4.2 | Platform-native navigation patterns |
| NFR4.3 | Accessibility (WCAG 2.1 AA) |
| NFR4.4 | Support for iOS 15+ and Android 8+ |

---

## Acceptance Criteria by Feature

### AC1: Authentication

```gherkin
Scenario: Successful login
  Given I am on the login screen
  When I enter valid email and password
  And I tap "Sign In"
  Then I should see the dashboard
  And my session should persist

Scenario: Login with invalid credentials
  Given I am on the login screen
  When I enter invalid email or password
  And I tap "Sign In"
  Then I should see an error message
  And I should remain on the login screen
```

### AC2: Add Expense (Manual)

```gherkin
Scenario: Add expense manually
  Given I am on the expenses screen
  When I tap the "+" button
  And I enter amount "42.50"
  And I select category "Groceries"
  And I enter merchant "Trader Joe's"
  And I tap "Save"
  Then the expense should appear in my list
  And it should sync to the server
```

### AC3: Scan Receipt

```gherkin
Scenario: Scan receipt and extract data
  Given I am adding a new expense
  When I tap "Scan Receipt"
  And I capture a photo of a receipt
  Then OCR should process the image locally
  And the form should be pre-filled with:
    | Field    | Value         |
    | Amount   | extracted $   |
    | Merchant | extracted name|
    | Date     | extracted date|
  And I can edit any field before saving

Scenario: OCR fails to extract data
  Given I have scanned a receipt
  When OCR cannot extract certain fields
  Then those fields should remain empty
  And I should be able to enter them manually
```

### AC4: Offline Support

```gherkin
Scenario: Add expense while offline
  Given I have no internet connection
  When I add a new expense
  Then it should be saved locally
  And a "pending sync" indicator should appear

Scenario: Sync when back online
  Given I have pending offline expenses
  When I regain internet connection
  Then pending expenses should sync automatically
  And the sync indicator should clear
```

---

## Out of Scope (v1)

The following features are explicitly NOT included in MVP:

- Bank account integration (Plaid)
- Recurring expense detection
- Multi-currency with live exchange rates
- Household/shared expense features
- Push notifications
- Widget support
- Apple Watch / WearOS companions
- Social sharing
- Export to accounting software

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User adoption | 50% of web users download mobile | Analytics |
| Daily active usage | 3x/week per user | App analytics |
| Expense entry time | < 30 seconds for manual, < 45s with OCR | User testing |
| OCR accuracy | > 85% correct field extraction | QA testing |
| Crash-free sessions | > 99.5% | Sentry/crash reporting |
| App store rating | > 4.5 stars | App Store / Play Store |

---

## Dependencies

### External Dependencies

| Dependency | Purpose | Risk Mitigation |
|------------|---------|-----------------|
| Supabase | Auth, DB, Storage | Already in production for web |
| Expo | Build toolchain | Proven, large community |
| EAS | Cloud builds | Local dev minimizes usage |
| ML Kit (Android) | On-device OCR | Free, no API limits |
| Vision (iOS) | On-device OCR | Native, no dependencies |

### Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| Supabase schema | Must match web app database |
| Receipt parsing logic | Port from `receiptParser.ts` |
| API types | Share TypeScript types with web |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| EAS build limit exceeded | Medium | High | Prioritize local dev builds with `expo run` |
| OCR accuracy varies by device | Medium | Medium | Fallback to manual entry, user corrections |
| Supabase schema changes | Low | High | Version schema migrations, sync carefully |
| React Native learning curve | Medium | Medium | Leverage Expo's abstractions |
| App Store approval delays | Low | Medium | Follow guidelines, no external payment flows |

---

## Timeline Overview

See [implementation-plan.md](./implementation-plan.md) for detailed timeline.

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 0: Setup** | 1 week | Project scaffold, CI/CD, dev environment |
| **Phase 1: Core** | 2 weeks | Auth, expense CRUD, basic UI |
| **Phase 2: OCR** | 2 weeks | Camera, on-device OCR, receipt parsing |
| **Phase 3: Features** | 2 weeks | Dashboard, budgets, offline support |
| **Phase 4: Polish** | 1 week | Testing, performance, app store prep |

**Total Estimated Timeline**: 8 weeks to MVP

---

## Approvals

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Tech Lead | | | Pending |
| Design | | | Pending |
