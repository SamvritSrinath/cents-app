/**
 * Orchestrates notification schedule sync when auth session or spend context changes.
 */

import type { DevicePreferences } from './devicePreferences';
import { syncNotificationSchedulesAsync } from './notifications';
import { fetchTodaySpendSnapshotAsync } from './todaySpend';

/**
 * When signed in: loads today’s spend snapshot and passes it into `syncNotificationSchedulesAsync`.
 * When signed out: syncs with `sessionActive: false` so daily summary state clears appropriately.
 */
export async function syncNotificationsForCurrentSessionAsync(
  preferences: DevicePreferences,
  user: { id: string } | null | undefined
): Promise<void> {
  if (!user) {
    await syncNotificationSchedulesAsync(preferences, { sessionActive: false });
    return;
  }

  const todaySpend = await fetchTodaySpendSnapshotAsync();
  await syncNotificationSchedulesAsync(preferences, {
    sessionActive: true,
    todaySpend: todaySpend ?? undefined,
  });
}
