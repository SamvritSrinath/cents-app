# Release (Android)

## Local Testing
- Use Expo Go for quick iteration.
- Validate login, create expense, and charts.

## Build with EAS
1. Install EAS CLI if needed.
2. Configure `eas.json` (not added yet).
3. Run:
```bash
npx eas build --platform android --profile production
```

## Store Readiness
- App icon and splash configured in `app.json`.
- Package name: `com.cents.app`.
- Verify permissions are minimal (camera only if receipt capture is used).

