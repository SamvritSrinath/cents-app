# Cents Mobile App - Technical Architecture

**Version**: 1.0  
**Last Updated**: 2024-12-18

---

## Overview

This document outlines the technical architecture for the Cents mobile app, including repository structure, technology choices, code sharing strategy with the web app, and platform-specific considerations.

---

## Technology Stack

### Core Framework

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native 0.73+ | Cross-platform, JS/TS, shared knowledge with web |
| **Build System** | Expo SDK 52+ | Managed workflow, EAS builds, OTA updates |
| **Router** | Expo Router v3 | File-based routing (matches Next.js patterns) |
| **Language** | TypeScript 5.x | Type safety, shared types with web app |

### State Management & Data

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Server State** | TanStack Query (React Query) | Caching, sync, same as web app |
| **Client State** | Zustand | Lightweight, familiar, matches web |
| **Local Storage** | Expo SecureStore + AsyncStorage | Tokens in SecureStore, data in AsyncStorage |
| **Offline DB** | WatermelonDB or SQLite | Offline-first with sync (optional Phase 2) |

### Backend Integration

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Database** | Supabase PostgreSQL | Shared with web app |
| **Auth** | Supabase Auth | Existing implementation |
| **Storage** | Supabase Storage | Receipt images |
| **Client** | @supabase/supabase-js | Official SDK, React Native compatible |

### UI Components

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Component Library** | React Native Paper or Tamagui | Material Design / Cross-platform primitives |
| **Icons** | Lucide React Native | Same as web app |
| **Charts** | Victory Native | React Native compatible, good perf |
| **Animation** | Reanimated 3 | Performant native animations |

### OCR (On-Device)

| Platform | Technology | Rationale |
|----------|------------|-----------|
| **iOS** | Apple Vision (VNRecognizeTextRequest) | Native, free, highly accurate |
| **Android** | Google ML Kit Text Recognition | On-device, free, no cloud calls |
| **Bridge** | react-native-mlkit-ocr / custom native modules | Abstract platform differences |

---

## Repository Structure

> **Decision**: Use a **separate repository** (`expensely-mobile`) for faster iteration with minimal disruption to the existing web app. See [Key Decisions Log](#appendix-key-decisions-log) for rationale.

### Primary Approach: Separate Repository ✅

```
expensely-mobile/                  # New GitHub repo
├── app/                           # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx              # Dashboard
│   │   ├── expenses.tsx
│   │   ├── budgets.tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx
│   ├── expenses/
│   │   ├── create.tsx
│   │   └── [id].tsx
│   ├── scan/
│   │   ├── index.tsx              # Camera capture
│   │   └── review.tsx             # OCR result review
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
│
├── components/                    # UI components
│   ├── ui/                        # Base components (Button, Input, etc.)
│   ├── ExpenseCard.tsx
│   ├── CategoryPicker.tsx
│   ├── ReceiptScanner.tsx
│   └── ...
│
├── contexts/
│   └── AuthContext.tsx
│
├── hooks/                         # React hooks
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   ├── useBudgets.ts
│   ├── useDashboard.ts
│   └── useNetworkStatus.ts
│
├── lib/                           # Shared code (COPIED from web repo)
│   ├── supabase.ts                # Supabase client (mobile-specific)
│   ├── receiptParser.ts           # 📋 Copied from expensely/src/lib/
│   └── utils.ts                   # 📋 Copied from expensely/src/lib/
│
├── types/                         # TypeScript types
│   └── database.ts                # 📋 Copied from expensely/src/types/
│
├── services/                      # Platform services
│   ├── ocr/
│   │   ├── index.ts               # Unified OCR interface
│   │   ├── vision.ios.ts          # iOS Vision implementation
│   │   └── mlkit.android.ts       # Android ML Kit implementation
│   └── offlineQueue.ts
│
├── theme/                         # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── assets/                        # Static assets
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
│
├── __tests__/                     # Test files
│   ├── lib/
│   ├── components/
│   └── integration/
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # Lint, typecheck, test
│
├── app.json                       # Expo config
├── eas.json                       # EAS Build config
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

### Code Sharing: Copy Files Approach

Since only ~15-20% of code is shareable, we'll **copy files** from the web repo rather than set up complex package management:

| Source (Web Repo) | Destination (Mobile Repo) | Sync Frequency |
|-------------------|---------------------------|----------------|
| `src/types/database.ts` | `types/database.ts` | When schema changes |
| `src/lib/receiptParser.ts` | `lib/receiptParser.ts` | When parser improves |
| `src/lib/utils.ts` (parts) | `lib/utils.ts` | Rarely |

**Sync Script** (optional):
```bash
#!/bin/bash
# sync-shared.sh - Run when web repo shared code changes

WEB_REPO="../expensely"
MOBILE_REPO="."

cp "$WEB_REPO/src/types/database.ts" "$MOBILE_REPO/types/"
cp "$WEB_REPO/src/lib/receiptParser.ts" "$MOBILE_REPO/lib/"
echo "✅ Shared code synced"
```

### Why Separate Repo?

| Factor | Separate Repo ✅ | Monorepo ❌ |
|--------|-----------------|-------------|
| Setup time | 1 hour | 1-2 days |
| Vercel config | Unchanged | Needs restructuring |
| Web app risk | Zero | Could break production |
| CI/CD | Independent | Shared (more complex) |
| EAS builds | Simple | Workspace configuration |
| Release cycles | Independent | Coupled |

### Future: Monorepo Migration Path

If code sharing becomes painful (syncing > 3x/month), migrate to monorepo:

```
expensely/                         # Future monorepo structure
├── apps/
│   ├── web/                       # Move current Next.js here
│   └── mobile/                    # Move mobile app here
├── packages/
│   └── shared/                    # Extract shared code
│       ├── types/
│       ├── lib/
│       └── package.json
├── turbo.json                     # Turborepo orchestration
└── package.json                   # Workspace root
```

---

## Code Sharing Strategy

### What to Share

| Code Type | Share? | Method |
|-----------|--------|--------|
| TypeScript types | ✅ Yes | `packages/shared/types` |
| Receipt parsing logic | ✅ Yes | `packages/shared/lib/receiptParser.ts` |
| Utility functions | ✅ Yes | Pure functions only |
| Supabase queries | ✅ Yes | `packages/supabase-client` |
| UI components | ❌ No | Platform-specific |
| API hooks | ⚡ Partially | Core logic shared, rendering platform-specific |
| Styling | ❌ No | Web uses Tailwind, mobile uses StyleSheet |

### Shared Types Example

```typescript
// packages/shared/src/types/database.ts
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category_id: string | null;
  merchant: string | null;
  description: string | null;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  user_id: string | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'weekly';
  start_date: string;
}

export interface ParsedReceipt {
  merchant: string | null;
  total: number | null;
  date: string | null;
  currency: string;
  items: Array<{ name: string; price: number }>;
  rawText: string;
  confidence: number;
}
```

### Shared Receipt Parser

The existing `receiptParser.ts` is already platform-agnostic (pure TypeScript):

```typescript
// packages/shared/src/lib/receiptParser.ts
// Direct port from src/lib/receiptParser.ts
// No changes needed - it's pure TypeScript with regex patterns
export { parseReceipt, validateReceipt } from './receiptParser';
export type { ParsedReceipt } from '../types/database';
```

---

## Platform-Specific Architecture

### OCR Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Unified OCR Interface                   │    │
│  │           services/ocr/index.ts                      │    │
│  │                                                      │    │
│  │  export async function scanReceipt(                  │    │
│  │    imagePath: string                                 │    │
│  │  ): Promise<OCRResult>                               │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│         ┌───────────────┴───────────────┐                   │
│         │                               │                   │
│  ┌──────▼──────┐                 ┌──────▼──────┐            │
│  │   iOS       │                 │  Android    │            │
│  │  Vision.ts  │                 │  MLKit.ts   │            │
│  │             │                 │             │            │
│  │  Native     │                 │  Native     │            │
│  │  Module     │                 │  Module     │            │
│  └──────┬──────┘                 └──────┬──────┘            │
│         │                               │                   │
└─────────┼───────────────────────────────┼───────────────────┘
          │                               │
    ┌─────▼─────┐                  ┌──────▼─────┐
    │   Apple   │                  │   Google   │
    │  Vision   │                  │  ML Kit    │
    │ Framework │                  │            │
    └───────────┘                  └────────────┘
```

### OCR Interface

```typescript
// services/ocr/index.ts
import { Platform } from 'react-native';

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
}

export async function recognizeText(imagePath: string): Promise<OCRResult> {
  if (Platform.OS === 'ios') {
    const { recognizeTextVision } = await import('./vision.ios');
    return recognizeTextVision(imagePath);
  } else {
    const { recognizeTextMLKit } = await import('./mlkit.android');
    return recognizeTextMLKit(imagePath);
  }
}

// Combined with receipt parser
export async function scanAndParseReceipt(imagePath: string) {
  const ocrResult = await recognizeText(imagePath);
  const { parseReceipt } = await import('@expensely/shared/receiptParser');
  return parseReceipt(ocrResult.text);
}
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React Native App                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────┐     ┌─────────────┐     ┌──────────────┐   │
│   │   Screens   │────▶│   Hooks     │────▶│  React Query │   │
│   │  (Expo      │     │  (custom)   │     │   (cache)    │   │
│   │   Router)   │     │             │     │              │   │
│   └─────────────┘     └─────────────┘     └──────┬───────┘   │
│                                                   │           │
│   ┌─────────────┐                         ┌──────▼───────┐   │
│   │   Zustand   │◀────────────────────────│  Supabase    │   │
│   │   (UI state)│                         │   Client     │   │
│   └─────────────┘                         └──────┬───────┘   │
│                                                   │           │
│   ┌─────────────┐     ┌─────────────┐            │           │
│   │  AsyncStore │◀────│  Offline    │◀───────────┘           │
│   │  (persist)  │     │   Queue     │                        │
│   └─────────────┘     └─────────────┘                        │
│                                                               │
└───────────────────────────────┬──────────────────────────────┘
                                │
                        ┌───────▼───────┐
                        │   Supabase    │
                        │   Cloud       │
                        │   (shared     │
                        │    with web)  │
                        └───────────────┘
```

---

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│   Supabase   │────▶│   Success    │
│    Screen    │     │   Auth       │     │   (token)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────▼───────┐
                                          │  SecureStore  │
                                          │  (tokens)     │
                                          └───────┬───────┘
                                                  │
┌──────────────┐                          ┌───────▼───────┐
│  Protected   │◀─────────────────────────│   AuthContext │
│   Screens    │                          │   Provider    │
└──────────────┘                          └───────────────┘
```

### Auth Implementation

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from SecureStore
    const restoreSession = async () => {
      const storedSession = await SecureStore.getItemAsync('supabase_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        supabase.auth.setSession(parsed);
      }
      setLoading(false);
    };
    
    restoreSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await SecureStore.setItemAsync(
            'supabase_session', 
            JSON.stringify(session)
          );
        } else {
          await SecureStore.deleteItemAsync('supabase_session');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... sign in, sign out methods
}
```

---

## Offline Strategy

### Phase 1 (MVP): Simple Queue

```typescript
// services/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedAction {
  id: string;
  type: 'CREATE_EXPENSE' | 'UPDATE_EXPENSE' | 'DELETE_EXPENSE';
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline_queue';

export async function addToQueue(action: Omit<QueuedAction, 'id' | 'timestamp'>) {
  const queue = await getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function processQueue() {
  const queue = await getQueue();
  const remaining: QueuedAction[] = [];
  
  for (const action of queue) {
    try {
      await processAction(action);
    } catch (error) {
      remaining.push(action);
    }
  }
  
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
```

### Phase 2 (Future): Full Offline DB

Consider WatermelonDB for complex offline sync:

```typescript
// Optional future enhancement
import { Database } from '@nozbe/watermelondb';
import { synchronize } from '@nozbe/watermelondb/sync';

// Two-way sync with Supabase
async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const { data } = await supabase
        .from('expenses')
        .select()
        .gt('updated_at', lastPulledAt);
      return { changes: data, timestamp: Date.now() };
    },
    pushChanges: async ({ changes }) => {
      // Push local changes to Supabase
    },
  });
}
```

---

## Environment Configuration

### EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "@supabase_url",
        "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY": "@supabase_PUBLISHABLE_DEFAULT_KEY"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### App Configuration

```json
// app.json
{
  "expo": {
    "name": "Cents",
    "slug": "cents-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "cents",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#09090b"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.cents",
      "infoPlist": {
        "NSCameraUsageDescription": "Used to scan receipts",
        "NSPhotoLibraryUsageDescription": "Used to select receipt images"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#09090b"
      },
      "package": "com.yourname.cents",
      "permissions": ["android.permission.CAMERA"]
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-image-picker",
      "expo-secure-store"
    ]
  }
}
```

---

## Security Considerations

### Token Storage

| Data | Storage | Encryption |
|------|---------|------------|
| Access Token | Expo SecureStore | Keychain (iOS) / Keystore (Android) |
| Refresh Token | Expo SecureStore | Hardware-backed |
| User Preferences | AsyncStorage | None (non-sensitive) |
| Offline Queue | AsyncStorage | Consider encryption |

### Network Security

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // Disable for mobile
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold launch | < 2s | Expo DevTools |
| Hot launch | < 500ms | Expo DevTools |
| Screen transition | < 100ms | React DevTools |
| OCR processing | < 3s | Custom timing |
| Bundle size (iOS) | < 50MB | EAS Build output |
| Bundle size (Android) | < 30MB | EAS Build output |
| Memory usage | < 200MB | Platform profilers |
| JS thread FPS | 60fps | React DevTools |

---

## Appendix: Key Decisions Log

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Framework | RN / Flutter | React Native | JS ecosystem, code sharing |
| Router | React Navigation / Expo Router | Expo Router | File-based, Next.js familiar |
| State | Redux / Zustand / Jotai | Zustand | Lightweight, matches web |
| OCR | Cloud / On-device | On-device | Privacy, no API costs |
| Offline | Simple queue / WatermelonDB | Simple queue (MVP) | YAGNI, add complexity later |
| Repo | Monorepo / Separate | Separate (then migrate) | Faster start, less friction |
