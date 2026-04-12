# Security policy

## Supported versions

Security fixes are applied on the latest release branch and `main` where practical. Use the current app version from `package.json` / `app.json`.

## Reporting a vulnerability

Please **do not** open a public issue for undisclosed security problems.

Instead, contact the maintainers privately (for example via GitHub Security Advisories for this repository, if enabled, or the email listed on the maintainer profile). Include:

- A short description of the issue and its impact
- Steps to reproduce or a proof of concept
- Affected versions or commits, if known

We aim to acknowledge reports within a few business days.

## Practices in this repo

- The mobile client uses only the Supabase **anon** key (`EXPO_PUBLIC_*`). Never embed the **service_role** key in the app.
- Row-level security (RLS) on the Supabase project is assumed; validate policies when changing schema.
- Saved “sign-in” on device stores **email only** in SecureStore for convenience, not passwords or tokens.
