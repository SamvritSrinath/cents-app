/**
 * @module notificationSessionSync
 * @owner Notifications
 *
 * Bridges auth + today's spend into {@link syncNotificationSchedulesAsync}.
 */

import type { DevicePreferences } from './devicePreferences';
import { syncNotificationSchedulesAsync } from './notifications';
import { fetchTodaySpendSnapshotAsync } from './todaySpend';

/**
 * Loads today's spend when signed in and syncs schedules; clears daily summary when signed out.
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
