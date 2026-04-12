---
title: Release and EAS
description: Version alignment, git tags, and manual EAS builds — CI does not build binaries.
---

# Release and EAS

## Motivation

Store releases need **aligned version numbers** and monotonic **native build identifiers**. This page is the source of truth for how Cents names releases; **CI does not run EAS** — you trigger cloud builds when you actually need an installable binary.

## Versioning

Keep these in sync for each user-visible release:

| Source | Field | Example |
| --- | --- | --- |
| `package.json` | `"version"` | `0.6.0` |
| `app.json` | `expo.version` | `0.6.0` |

When publishing to stores, bump **Android `versionCode`** and **iOS `buildNumber`** (in `app.json` or via EAS) so stores accept each binary. Add `eas.json` with `npx eas build:configure` if it is missing.

## Git tags

After merging a release to `main`:

```bash
git tag -a v0.6.0 -m "Release 0.6.0"
git push origin v0.6.0
```

Use the same SemVer as `package.json` / `expo.version`, with a `v` prefix on the tag.

## Local testing before a tag

- Smoke-test in **Expo Go**: auth, create expense, dashboard charts.
- Run `npm run test:ci` and `npm run typecheck`.

## Build with EAS (manual)

1. Install EAS CLI.
2. Ensure `eas.json` exists (`npx eas build:configure`).
3. Configure **environment variables** on EAS — `.env.local` is **not** uploaded to builders; set `EXPO_PUBLIC_*` in the Expo dashboard or EAS secrets.
4. Example production Android build:

```bash
npx eas build --platform android --profile production
```

## Store readiness checklist

- Icon and splash configured in `app.json`.
- Android package name matches your Play Console app.
- Permissions stay minimal (camera / media only where receipt capture requires them).

## Next

[Contributing on GitHub](https://github.com/SamvritSrinath/cents-app/blob/main/CONTRIBUTING.md) — fork/PR workflow and doc commands.
