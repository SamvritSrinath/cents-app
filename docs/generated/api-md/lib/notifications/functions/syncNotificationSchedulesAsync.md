# Function: syncNotificationSchedulesAsync()

> **syncNotificationSchedulesAsync**(`preferences`, `context?`): `Promise`\<`void`\>

Sync scheduled local notifications from preferences.
When daily summary is on and the user is signed in, reschedules a one-shot notification
for the next 8:00 PM local time with today's spend in the body. Resync on app foreground
(see NotificationPreferenceSync) so the amount stays fresh.

## Parameters

### preferences

[`DevicePreferences`](../../devicePreferences/interfaces/DevicePreferences.md)

### context?

[`NotificationSyncContext`](../type-aliases/NotificationSyncContext.md)

## Returns

`Promise`\<`void`\>
