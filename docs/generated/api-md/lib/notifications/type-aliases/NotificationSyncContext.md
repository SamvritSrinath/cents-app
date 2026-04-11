[**cents-app**](../../../README.md)

***

[cents-app](../../../README.md) / [lib/notifications](../README.md) / NotificationSyncContext

# Type Alias: NotificationSyncContext

> **NotificationSyncContext** = `object`

## Properties

### sessionActive

> **sessionActive**: `boolean`

When false, daily summary notifications are cleared (e.g. signed out).

***

### todaySpend?

> `optional` **todaySpend?**: `object`

Spend for the device-local calendar day; used in notification body when session is active.

#### currency

> **currency**: `string`

#### total

> **total**: `number`
