[**cents-app**](../../../README.md)

***

[cents-app](../../../README.md) / [lib/buildConfig](../README.md) / isMissingSupabasePublicEnv

# Function: isMissingSupabasePublicEnv()

> **isMissingSupabasePublicEnv**(): `boolean`

EXPO_PUBLIC_* values are inlined when JavaScript is bundled.
`eas build` runs on Expo servers and does not read .env.local (gitignored).
Set the same names under Expo → Environment variables for preview/production.

## Returns

`boolean`
