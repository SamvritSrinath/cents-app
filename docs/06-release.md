# Release (Android)

## Versioning

Keep these in sync for each user-visible release:

| Source | Field | Example |
| --- | --- | --- |
| [`package.json`](../package.json) | `"version"` | `0.5.0` |
| [`app.json`](../app.json) | `expo.version` | `0.5.0` |

When you publish to app stores, also bump **Android `versionCode`** and **iOS `buildNumber`** (in `app.json` or via EAS) so stores accept each binary. Add `eas.json` if missing (`npx eas build:configure`).

### Git tags

After merging a release to `main`:

```bash
git tag -a v0.5.0 -m "Release 0.5.0"
git push origin v0.5.0
```

Use the same SemVer as `package.json` / `expo.version`, with a `v` prefix on the tag.

---

## Release 0.5.0

**Summary:** CI documentation (including generated pipeline reference), Prettier check in CI, Jest `test:ci` with coverage thresholds, `useCategories` tests, expanded `categoryAggregation` tests, `.prettierignore`, optional Supabase seed migration for default Groceries category, README and release doc updates, typography and performance follow-up doc.

**Tag:** `v0.5.0`

---

## Local testing

- Use Expo Go for quick iteration.
- Validate login, create expense, and charts.

## Build with EAS

1. Install EAS CLI if needed.
2. Configure `eas.json` (create with `npx eas build:configure` if not present).
3. Run:

```bash
npx eas build --platform android --profile production
```

## Store readiness

- App icon and splash configured in `app.json`.
- Package name: `com.cents.app`.
- Verify permissions are minimal (camera and media access for receipt capture).
