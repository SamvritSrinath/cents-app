# End-to-end testing

## What runs in CI today

After **unit tests** pass, the workflow runs **`npm run test:e2e:ci`**, which exports an **Android JavaScript bundle** via `expo export`. That is not a full device UI test, but it exercises Metro resolution and catches many broken imports and config issues that unit tests can miss.

## Going further (recommended)

For real UI E2E on a simulator or device, add one of:

- **[Maestro](https://maestro.mobile.dev/)** — YAML flows, works well with Expo; run locally with `maestro test e2e/maestro/…` once you add flows.
- **Detox** — deeper native integration, heavier setup.

Place Maestro flows under `e2e/maestro/` and extend `.github/workflows/ci.yml` with an emulator job when you are ready (slower, optional branch or workflow).

## Local commands

```bash
# Same bundle smoke CI runs after unit tests
npm run test:e2e:ci
```
