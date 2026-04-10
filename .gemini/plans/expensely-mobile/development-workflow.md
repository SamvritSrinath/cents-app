# Cents Mobile App - Development Workflow

**Version**: 1.0  
**Last Updated**: 2024-12-18

---

## Overview

This document outlines the development workflow for the Cents mobile app, focusing on **local-first development** to maximize productivity while conserving EAS build credits.

---

## Environment Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| npm | 10+ | Package manager |
| Expo CLI | Latest | Development tooling |
| EAS CLI | Latest | Build service (when needed) |
| Xcode | 15+ | iOS simulator (macOS) |
| Android Studio | Latest | Android emulator |
| Watchman | Latest | File watching (macOS) |

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/expensely.git
cd expensely

# 2. Install dependencies (if monorepo)
npm install

# 3. Navigate to mobile app
cd apps/mobile  # or root if separate repo

# 4. Install mobile dependencies
npm install

# 5. Create local environment file
cp .env.example .env.local

# 6. Configure environment variables
echo "EXPO_PUBLIC_SUPABASE_URL=your-supabase-url" >> .env.local
echo "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key" >> .env.local

# 7. Install iOS pods (macOS only)
npx expo install --fix
cd ios && pod install && cd ..

# 8. Verify setup
npx expo doctor
```

### IDE Configuration

**VS Code Extensions**:
- ES7+ React/Redux/React-Native snippets
- Expo Tools
- ESLint
- Prettier
- React Native Tools
- GitLens

**VS Code Settings**:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.tsx": "typescriptreact"
  }
}
```

---

## Daily Development Workflow

### Starting Development

```bash
# Start Metro bundler with Expo
npx expo start

# Options:
# Press 'i' - Open iOS simulator
# Press 'a' - Open Android emulator
# Press 'w' - Open web (for quick testing)
# Press 'r' - Reload app
# Press 'm' - Toggle menu
# Press 'j' - Open debugger
```

### Development Modes

| Mode | Command | Use Case |
|------|---------|----------|
| **Expo Go** | `npx expo start` | Quick iteration, no native code |
| **Development Build** | `npx expo run:ios` | Native modules, debugging |
| **Production Preview** | `npx expo start --no-dev` | Test prod behavior locally |

### When to Use Each Mode

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Mode Decision Tree            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are you using native modules (camera, OCR)?                │
│      │                                                       │
│      ├── NO → Use Expo Go (fastest iteration)               │
│      │         npx expo start                                │
│      │                                                       │
│      └── YES → Do you have a dev build already?             │
│                    │                                         │
│                    ├── YES → Use existing dev build          │
│                    │         npx expo start --dev-client     │
│                    │                                         │
│                    └── NO → Build locally (free!)            │
│                              npx expo run:ios                │
│                              npx expo run:android            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Build Process (No EAS Credits!)

### iOS Local Build

```bash
# First time: Generate native project
npx expo prebuild --platform ios

# Build and run on simulator
npx expo run:ios

# Build for specific simulator
npx expo run:ios --device "iPhone 15 Pro"

# Build for physical device (requires provisioning)
npx expo run:ios --device
```

### Android Local Build

```bash
# First time: Generate native project
npx expo prebuild --platform android

# Build and run on emulator
npx expo run:android

# Build for specific device
npx expo run:android --device "Pixel_7_API_34"

# Create APK for testing
cd android && ./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Cleaning Native Projects

```bash
# Reset everything (nuclear option)
npx expo prebuild --clean

# iOS only
cd ios && rm -rf Pods Podfile.lock && pod install

# Android only
cd android && ./gradlew clean
```

---

## Git Workflow

### Branch Strategy

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/auth-flow
  │     ├── feature/expense-crud
  │     ├── feature/ocr-scanning
  │     └── fix/login-error
  │
  └── release/v1.0.0
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/receipt-scanner` |
| Bug Fix | `fix/<description>` | `fix/login-crash` |
| Hotfix | `hotfix/<description>` | `hotfix/auth-token-expire` |
| Release | `release/v<version>` | `release/v1.0.0` |
| Chore | `chore/<description>` | `chore/update-dependencies` |

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:

```bash
git commit -m "feat(expenses): add receipt scanning with OCR"
git commit -m "fix(auth): resolve token refresh loop"
git commit -m "docs(readme): add setup instructions"
git commit -m "test(parser): add receipt parser unit tests"
```

### Pull Request Process

1. **Create branch from `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Develop and commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Run checks before pushing**
   ```bash
   npm run lint
   npm run test
   npx tsc --noEmit
   ```

4. **Push and create PR**
   ```bash
   git push -u origin feature/my-feature
   # Open PR to develop branch
   ```

5. **PR Requirements**
   - [ ] All CI checks pass
   - [ ] Code review approved
   - [ ] No merge conflicts
   - [ ] Tests for new features

---

## EAS Build Strategy

### Build Credit Allocation (15/month)

| Build Type | iOS | Android | Total | When |
|------------|-----|---------|-------|------|
| Development | 2 | 2 | 4 | Start of sprint |
| Preview | 2 | 2 | 4 | Before testing |
| Production | 2 | 2 | 4 | Release |
| Buffer | - | - | 3 | Emergencies |

### When to Use EAS Builds

| Scenario | Use EAS? | Alternative |
|----------|----------|-------------|
| Daily development | ❌ | `npx expo run:*` |
| Testing native modules | ❌ | Local dev build |
| Team testing | ✅ | EAS Development |
| Beta testing | ✅ | EAS Preview |
| App Store release | ✅ | EAS Production |
| CI/CD | ⚠️ | Only on main merge |

### EAS Build Commands

```bash
# Development build (internal testing)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (wider testing)
eas build --profile preview --platform all

# Production build (App Store)
eas build --profile production --platform all

# Check build status
eas build:list
```

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
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Debugging

### React Native Debugger

```bash
# Install React Native Debugger (macOS)
brew install --cask react-native-debugger

# Or use Flipper
brew install --cask flipper
```

### Debugging Tools

| Tool | Purpose | Best For |
|------|---------|----------|
| Chrome DevTools | JS debugging | Logic issues |
| React DevTools | Component inspection | UI issues |
| Flipper | Native debugging | Native modules |
| Reactotron | State inspection | State management |
| Xcode | iOS native debugging | Crashes, perf |
| Android Studio | Android debugging | Crashes, perf |

### Console Logging

```typescript
// Use __DEV__ for development-only logs
if (__DEV__) {
  console.log('Debug info:', data);
}

// Or use a logger utility
import { logger } from '@/utils/logger';
logger.debug('Debug message');
logger.info('Info message');
logger.error('Error message', error);
```

### Network Debugging

```typescript
// Enable network inspector in development
if (__DEV__) {
  // In app entry point
  import { XMLHttpRequest } from 'react-native';
  global.XMLHttpRequest = XMLHttpRequest;
}
```

---

## Environment Variables

### Local Development

```bash
# .env.local (not committed)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGc...
EXPO_PUBLIC_OCR_ENDPOINT=http://localhost:8000  # Optional
```

### EAS Secrets (for builds)

```bash
# Set secrets for EAS
eas secret:create --name SUPABASE_URL --value "https://xxxx.supabase.co"
eas secret:create --name SUPABASE_PUBLISHABLE_DEFAULT_KEY --value "eyJhbGc..."

# List secrets
eas secret:list
```

### Accessing Environment Variables

```typescript
// In code
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// In app.config.js
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
```

---

## Release Process

### Version Bumping

```bash
# Update version in app.json
# Major: Breaking changes
# Minor: New features
# Patch: Bug fixes

npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### Release Checklist

- [ ] All tests passing
- [ ] Version bumped in `app.json`
- [ ] Changelog updated
- [ ] PR merged to `main`
- [ ] Create GitHub release
- [ ] Build production binaries
- [ ] Submit to TestFlight/Internal Testing
- [ ] QA verification
- [ ] Submit to App Store/Play Store

### App Store Submission

```bash
# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Useful Scripts

```json
// package.json
{
  "scripts": {
    // Development
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "web": "expo start --web",
    
    // Quality
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,json}\"",
    
    // Testing
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    // Building
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean",
    
    // EAS (use sparingly!)
    "build:dev": "eas build --profile development --platform all",
    "build:preview": "eas build --profile preview --platform all",
    "build:prod": "eas build --profile production --platform all",
    
    // Utilities
    "doctor": "expo doctor",
    "upgrade": "expo upgrade",
    "clean": "rm -rf node_modules ios/Pods android/.gradle .expo"
  }
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Metro bundler hangs | `npx expo start --clear` |
| Pod install fails | `cd ios && pod repo update && pod install` |
| Android build fails | `cd android && ./gradlew clean` |
| TypeScript errors | `rm -rf node_modules && npm install` |
| Expo Go not connecting | Check same WiFi network, try tunnel mode |
| Native module not found | Rebuild with `npx expo run:*` |

### Reset Everything

```bash
# Nuclear option - reset all caches and rebuilds
watchman watch-del-all
rm -rf node_modules
rm -rf ios/Pods ios/build
rm -rf android/.gradle android/app/build
npm cache clean --force
npm install
cd ios && pod install && cd ..
npx expo start --clear
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                 CENTS MOBILE - QUICK REFERENCE              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  START DEVELOPMENT                                          │
│  ─────────────────                                          │
│  npx expo start          # Start with Expo Go               │
│  npx expo run:ios        # Build & run on iOS simulator     │
│  npx expo run:android    # Build & run on Android emulator  │
│                                                             │
│  TESTING                                                    │
│  ───────                                                    │
│  npm test                # Run all tests                    │
│  npm run test:watch      # Watch mode                       │
│  npm run test:coverage   # With coverage                    │
│                                                             │
│  CODE QUALITY                                               │
│  ────────────                                               │
│  npm run lint            # Check linting                    │
│  npm run typecheck       # TypeScript check                 │
│  npm run format          # Format code                      │
│                                                             │
│  EAS BUILDS (conserve credits!)                             │
│  ──────────                                                 │
│  eas build --profile development --platform ios             │
│  eas build --profile preview --platform all                 │
│  eas build --profile production --platform all              │
│                                                             │
│  TROUBLESHOOTING                                            │
│  ───────────────                                            │
│  npx expo start --clear  # Clear cache                      │
│  npx expo doctor         # Check environment                │
│  npm run clean           # Reset everything                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```
