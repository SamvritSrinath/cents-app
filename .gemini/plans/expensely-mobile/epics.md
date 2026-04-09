# Cents Mobile App - Epics & Issues

**Version**: 1.0  
**Last Updated**: 2024-12-18

This document organizes the mobile app development into trackable epics and issues for project management (GitHub Issues, Linear, Jira, etc.).

---

## Epic Overview

| Epic | Priority | Timeline | Issues |
|------|----------|----------|--------|
| [E0: Project Setup](#e0-project-setup) | P0 | Week 1 | 8 |
| [E1: Authentication](#e1-authentication) | P0 | Week 2 | 7 |
| [E2: Expense Management](#e2-expense-management) | P0 | Week 2-3 | 12 |
| [E3: OCR & Receipt Scanning](#e3-ocr--receipt-scanning) | P0 | Week 4-5 | 10 |
| [E4: Dashboard & Analytics](#e4-dashboard--analytics) | P1 | Week 6 | 8 |
| [E5: Budget Management](#e5-budget-management) | P1 | Week 6 | 6 |
| [E6: Offline Support](#e6-offline-support) | P2 | Week 7 | 5 |
| [E7: Settings & Profile](#e7-settings--profile) | P2 | Week 7 | 5 |
| [E8: Testing Infrastructure](#e8-testing-infrastructure) | P1 | Ongoing | 7 |
| [E9: CI/CD & DevOps](#e9-cicd--devops) | P1 | Week 1, 8 | 6 |
| [E10: Release & App Store](#e10-release--app-store) | P0 | Week 8 | 5 |

**Total Issues**: ~79

---

## E0: Project Setup

**Priority**: P0  
**Timeline**: Week 1  
**Goal**: Establish development environment and project structure

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E0-1 | Initialize Expo project with TypeScript | task | 2h | `setup`, `infrastructure` |
| E0-2 | Configure Expo Router for navigation | task | 3h | `setup`, `navigation` |
| E0-3 | Set up Supabase client for React Native | task | 2h | `setup`, `backend` |
| E0-4 | Configure TanStack Query | task | 1h | `setup`, `state` |
| E0-5 | Set up Zustand for client state | task | 1h | `setup`, `state` |
| E0-6 | Create design tokens and theme | task | 3h | `setup`, `design` |
| E0-7 | Configure ESLint and Prettier | task | 1h | `setup`, `dx` |
| E0-8 | Set up environment variables | task | 1h | `setup`, `security` |

### Acceptance Criteria

- [ ] `npx expo start` launches without errors
- [ ] Supabase connection verified
- [ ] Theme matches web app aesthetic
- [ ] Linting and formatting work

---

## E1: Authentication

**Priority**: P0  
**Timeline**: Week 2  
**Goal**: Users can sign up, log in, and maintain sessions

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E1-1 | Create AuthContext provider | feature | 4h | `auth`, `state` |
| E1-2 | Implement secure token storage | feature | 3h | `auth`, `security` |
| E1-3 | Build login screen UI | feature | 4h | `auth`, `ui` |
| E1-4 | Build signup screen UI | feature | 3h | `auth`, `ui` |
| E1-5 | Implement protected routes | feature | 2h | `auth`, `navigation` |
| E1-6 | Add password reset flow | feature | 3h | `auth`, `ui` |
| E1-7 | Handle session persistence | feature | 2h | `auth`, `ux` |

### User Stories

```gherkin
As a user, I want to:
- Sign up with email and password
- Log in to my existing account  
- Stay logged in across app restarts
- Reset my password if forgotten
- Log out from any screen
```

---

## E2: Expense Management

**Priority**: P0  
**Timeline**: Weeks 2-3  
**Goal**: Full CRUD for expenses with category support

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E2-1 | Create tab navigator layout | feature | 2h | `navigation`, `ui` |
| E2-2 | Build expense list screen | feature | 4h | `expenses`, `ui` |
| E2-3 | Implement infinite scroll pagination | feature | 3h | `expenses`, `performance` |
| E2-4 | Create ExpenseCard component | feature | 2h | `expenses`, `ui` |
| E2-5 | Build create expense form | feature | 4h | `expenses`, `ui` |
| E2-6 | Implement date picker | feature | 2h | `expenses`, `ui` |
| E2-7 | Build category picker modal | feature | 3h | `expenses`, `categories` |
| E2-8 | Create edit expense screen | feature | 2h | `expenses`, `ui` |
| E2-9 | Implement delete with confirmation | feature | 1h | `expenses`, `ui` |
| E2-10 | Add pull-to-refresh | feature | 1h | `expenses`, `ux` |
| E2-11 | Design empty states | feature | 2h | `expenses`, `ui` |
| E2-12 | Implement expense search/filter | feature | 4h | `expenses`, `search` |

### API Integration

```typescript
// Endpoints to integrate
GET    /expenses        - List with pagination
POST   /expenses        - Create expense
GET    /expenses/:id    - Get single expense
PATCH  /expenses/:id    - Update expense
DELETE /expenses/:id    - Delete expense
GET    /categories      - List categories
```

---

## E3: OCR & Receipt Scanning

**Priority**: P0  
**Timeline**: Weeks 4-5  
**Goal**: On-device receipt scanning with automatic field extraction

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E3-1 | Set up expo-camera module | task | 2h | `ocr`, `setup` |
| E3-2 | Build receipt capture screen | feature | 4h | `ocr`, `ui` |
| E3-3 | Implement image cropping | feature | 4h | `ocr`, `ui` |
| E3-4 | Integrate expo-image-picker | feature | 2h | `ocr`, `ui` |
| E3-5 | Implement iOS Vision OCR module | feature | 8h | `ocr`, `ios`, `native` |
| E3-6 | Implement Android ML Kit OCR | feature | 8h | `ocr`, `android`, `native` |
| E3-7 | Create unified OCR interface | feature | 2h | `ocr`, `architecture` |
| E3-8 | Port receiptParser.ts to shared package | task | 3h | `ocr`, `shared` |
| E3-9 | Build OCR result review screen | feature | 4h | `ocr`, `ui` |
| E3-10 | Add confidence indicators | feature | 2h | `ocr`, `ux` |

### Technical Notes

- Research: `react-native-mlkit-ocr` vs custom native modules
- iOS requires VNRecognizeTextRequest (Vision framework)
- Android uses Google ML Kit Text Recognition
- All processing must be on-device (privacy requirement)

---

## E4: Dashboard & Analytics

**Priority**: P1  
**Timeline**: Week 6  
**Goal**: Visual spending insights and summary

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E4-1 | Set up Victory Native for charts | task | 2h | `dashboard`, `setup` |
| E4-2 | Build dashboard layout | feature | 3h | `dashboard`, `ui` |
| E4-3 | Create spending summary card | feature | 2h | `dashboard`, `ui` |
| E4-4 | Implement category pie chart | feature | 4h | `dashboard`, `charts` |
| E4-5 | Implement monthly trend chart | feature | 4h | `dashboard`, `charts` |
| E4-6 | Build recent transactions widget | feature | 2h | `dashboard`, `ui` |
| E4-7 | Add month-over-month comparison | feature | 2h | `dashboard`, `analytics` |
| E4-8 | Create useDashboardData hook | feature | 3h | `dashboard`, `data` |

### Data Aggregations Needed

```sql
-- Spending this month
SELECT SUM(amount) FROM expenses WHERE expense_date >= date_trunc('month', now())

-- Category breakdown
SELECT category_id, SUM(amount) FROM expenses GROUP BY category_id

-- Monthly trends (last 6 months)
SELECT date_trunc('month', expense_date), SUM(amount) FROM expenses GROUP BY 1
```

---

## E5: Budget Management

**Priority**: P1  
**Timeline**: Week 6  
**Goal**: Create and track budgets per category

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E5-1 | Build budget list screen | feature | 3h | `budgets`, `ui` |
| E5-2 | Create budget progress component | feature | 2h | `budgets`, `ui` |
| E5-3 | Build create/edit budget form | feature | 3h | `budgets`, `ui` |
| E5-4 | Implement budget utilization calc | feature | 2h | `budgets`, `data` |
| E5-5 | Add over-budget highlighting | feature | 1h | `budgets`, `ux` |
| E5-6 | Show budget status on dashboard | feature | 2h | `budgets`, `dashboard` |

---

## E6: Offline Support

**Priority**: P2  
**Timeline**: Week 7  
**Goal**: Allow expense entry without network connectivity

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E6-1 | Create network status hook | feature | 2h | `offline`, `util` |
| E6-2 | Implement offline action queue | feature | 4h | `offline`, `sync` |
| E6-3 | Add sync indicator UI | feature | 2h | `offline`, `ui` |
| E6-4 | Implement background sync | feature | 3h | `offline`, `sync` |
| E6-5 | Handle conflict resolution | feature | 3h | `offline`, `sync` |

### Technical Approach

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Action    │────▶│  AsyncStorage   │────▶│   Sync Queue    │
│  (offline)      │     │  (local cache)  │     │  (pending ops)  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Supabase      │
                                                │   (when online) │
                                                └─────────────────┘
```

---

## E7: Settings & Profile

**Priority**: P2  
**Timeline**: Week 7  
**Goal**: User preferences and profile management

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E7-1 | Build settings screen layout | feature | 2h | `settings`, `ui` |
| E7-2 | Implement profile editing | feature | 2h | `settings`, `ui` |
| E7-3 | Add currency preference | feature | 2h | `settings`, `preferences` |
| E7-4 | Create about/version section | feature | 1h | `settings`, `ui` |
| E7-5 | Implement logout flow | feature | 1h | `settings`, `auth` |

---

## E8: Testing Infrastructure

**Priority**: P1  
**Timeline**: Ongoing  
**Goal**: Comprehensive test coverage and CI integration

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E8-1 | Configure Jest for React Native | task | 2h | `testing`, `setup` |
| E8-2 | Set up Testing Library | task | 1h | `testing`, `setup` |
| E8-3 | Configure MSW for API mocking | task | 2h | `testing`, `setup` |
| E8-4 | Write unit tests for receiptParser | test | 4h | `testing`, `unit` |
| E8-5 | Write component tests for UI | test | 6h | `testing`, `component` |
| E8-6 | Set up Detox for E2E testing | task | 4h | `testing`, `e2e` |
| E8-7 | Write critical path E2E tests | test | 6h | `testing`, `e2e` |

### Coverage Targets

| Category | Target |
|----------|--------|
| Unit tests | 90% |
| Component tests | 80% |
| Integration tests | 70% |
| E2E tests | Critical paths |

---

## E9: CI/CD & DevOps

**Priority**: P1  
**Timeline**: Week 1, Week 8  
**Goal**: Automated testing, linting, and builds

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E9-1 | Create GitHub Actions lint workflow | task | 2h | `ci`, `quality` |
| E9-2 | Create GitHub Actions test workflow | task | 2h | `ci`, `testing` |
| E9-3 | Set up EAS Build configuration | task | 2h | `ci`, `eas` |
| E9-4 | Configure build on merge to main | task | 2h | `ci`, `eas` |
| E9-5 | Set up EAS Submit for stores | task | 2h | `cd`, `release` |
| E9-6 | Document CI/CD pipeline | docs | 2h | `docs`, `ci` |

### Pipeline Architecture

```yaml
# Trigger: Push to any branch
lint-and-test:
  - ESLint
  - TypeScript check
  - Jest tests
  
# Trigger: Merge to main
build:
  - EAS Build (development profile)
  
# Trigger: Tag v*.*.*
release:
  - EAS Build (production profile)
  - EAS Submit
```

---

## E10: Release & App Store

**Priority**: P0  
**Timeline**: Week 8  
**Goal**: Ship MVP to TestFlight and Play Store

### Issues

| ID | Title | Type | Est. | Labels |
|----|-------|------|------|--------|
| E10-1 | Create app icons and splash screen | task | 3h | `release`, `design` |
| E10-2 | Prepare App Store screenshots | task | 3h | `release`, `marketing` |
| E10-3 | Write App Store descriptions | task | 2h | `release`, `marketing` |
| E10-4 | Submit to TestFlight | task | 2h | `release`, `ios` |
| E10-5 | Submit to Play Store internal | task | 2h | `release`, `android` |

### Release Checklist

- [ ] App icons (1024x1024 iOS, 512x512 Android)
- [ ] Splash screen
- [ ] 6 screenshots per platform
- [ ] Feature graphic (Android)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire

---

## Labels Reference

| Label | Description |
|-------|-------------|
| `setup` | Initial configuration |
| `ui` | User interface work |
| `feature` | New functionality |
| `auth` | Authentication related |
| `expenses` | Expense management |
| `ocr` | Receipt scanning |
| `dashboard` | Dashboard screen |
| `budgets` | Budget tracking |
| `offline` | Offline support |
| `settings` | Settings screen |
| `testing` | Test-related |
| `ci` | Continuous integration |
| `release` | Release process |
| `ios` | iOS-specific |
| `android` | Android-specific |
| `native` | Native module work |
| `security` | Security related |
| `performance` | Performance work |
| `dx` | Developer experience |
| `docs` | Documentation |

---

## GitHub Issue Template

```markdown
## Description
[Brief description of the task]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
[Any implementation details, links to docs, etc.]

## Design
[Link to designs if applicable]

## Dependencies
- Depends on: #XX
- Blocks: #YY

## Estimate
[ ] Small (< 2h)
[ ] Medium (2-4h)
[ ] Large (4-8h)
[ ] XL (> 8h)
```

---

## Sprint Planning Suggestion

### Sprint 1 (Week 1-2)
- E0: Project Setup (all issues)
- E1: Authentication (all issues)
- E8-1, E8-2, E8-3: Testing setup
- E9-1, E9-2: CI setup

### Sprint 2 (Week 3-4)
- E2: Expense Management (all issues)
- E3-1 to E3-4: Camera/image handling
- E8-4: Parser unit tests

### Sprint 3 (Week 5-6)
- E3-5 to E3-10: OCR implementation
- E4: Dashboard (all issues)
- E5: Budgets (all issues)

### Sprint 4 (Week 7-8)
- E6: Offline Support (all issues)
- E7: Settings (all issues)
- E8-5 to E8-7: Remaining tests
- E9-3 to E9-6: CI/CD completion
- E10: Release (all issues)

---

## Progress Tracking Template

```markdown
## Week X Progress

### Completed
- [ ] E0-1: Initialize Expo project ✅
- [ ] E0-2: Configure Expo Router ✅

### In Progress
- [ ] E1-1: Create AuthContext provider 🔄

### Blocked
- [ ] E3-5: iOS Vision OCR (waiting for device) ⛔

### Notes
- Discovered issue with X, mitigation: Y
- EAS builds remaining: 12/15
```
