# Function: syncNotificationsForCurrentSessionAsync()

> **syncNotificationsForCurrentSessionAsync**(`preferences`, `user`): `Promise`\<`void`\>

When signed in: loads today’s spend snapshot and passes it into `syncNotificationSchedulesAsync`.
When signed out: syncs with `sessionActive: false` so daily summary state clears appropriately.

## Parameters

### preferences

[`DevicePreferences`](../../devicePreferences/interfaces/DevicePreferences.md)

### user

\{ `id`: `string`; \} \| `null` \| `undefined`

## Returns

`Promise`\<`void`\>
