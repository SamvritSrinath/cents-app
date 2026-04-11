import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DevicePreferences } from './devicePreferences';
import { formatCurrency } from './utils';

const DAILY_SUMMARY_TYPE = 'daily_summary';
const DEFAULT_SUMMARY_HOUR = 20;
const DEFAULT_SUMMARY_MINUTE = 0;

export type NotificationSyncContext = {
  /** When false, daily summary notifications are cleared (e.g. signed out). */
  sessionActive: boolean;
  /** Spend for the device-local calendar day; used in notification body when session is active. */
  todaySpend?: { total: number; currency: string };
};

type ExpoNotificationsModule = typeof import('expo-notifications');
let notificationsModule: ExpoNotificationsModule | null | undefined;
let handlerConfigured = false;

function isExpoGoAndroid(): boolean {
  return Platform.OS === 'android' && Constants.appOwnership === 'expo';
}

function getNotificationsModule(): ExpoNotificationsModule | null {
  if (isExpoGoAndroid()) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require('expo-notifications') as ExpoNotificationsModule;
    notificationsModule = loaded;

    if (!handlerConfigured) {
      loaded.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    }
  } catch {
    notificationsModule = null;
  }

  return notificationsModule;
}

export function isLocalNotificationsSupported(): boolean {
  return getNotificationsModule() !== null;
}

export function getNotificationPlan(preferences: DevicePreferences): {
  cancelAll: boolean;
  dailySummaryEnabled: boolean;
} {
  if (!preferences.notificationsEnabled) {
    return { cancelAll: true, dailySummaryEnabled: false };
  }

  return {
    cancelAll: false,
    dailySummaryEnabled: preferences.dailySummaryEnabled,
  };
}

/** Next local wall-clock fire time at hour:minute (today if still ahead, else tomorrow). */
export function getNextDailySummaryFireDate(
  hour: number = DEFAULT_SUMMARY_HOUR,
  minute: number = DEFAULT_SUMMARY_MINUTE
): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

async function ensurePermissionsAsync(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function scheduleTestNotificationAsync(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return false;

  const hasPermission = await ensurePermissionsAsync();
  if (!hasPermission) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Cents',
      body: 'Notifications are set up and working on this device.',
      data: { type: 'test' },
    },
    trigger: null,
  });

  return true;
}

async function cancelDailySummaryNotificationsAsync(
  Notifications: NonNullable<ReturnType<typeof getNotificationsModule>>
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const dailySummaryScheduled = scheduled.filter(
    (notification) => notification.content?.data?.type === DAILY_SUMMARY_TYPE
  );
  await Promise.all(
    dailySummaryScheduled.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
}

function buildDailySummaryBody(
  todaySpend: { total: number; currency: string } | undefined
): string {
  if (todaySpend === undefined) {
    return "Open Cents to review today's expenses.";
  }
  if (todaySpend.total <= 0) {
    return 'No expenses logged today.';
  }
  return `Spent ${formatCurrency(todaySpend.total, todaySpend.currency)} today.`;
}

/**
 * Sync scheduled local notifications from preferences.
 * When daily summary is on and the user is signed in, reschedules a one-shot notification
 * for the next 8:00 PM local time with today's spend in the body. Resync on app foreground
 * (see NotificationPreferenceSync) so the amount stays fresh.
 */
export async function syncNotificationSchedulesAsync(
  preferences: DevicePreferences,
  context?: NotificationSyncContext
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  const plan = getNotificationPlan(preferences);

  if (plan.cancelAll) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  await cancelDailySummaryNotificationsAsync(Notifications);

  if (!plan.dailySummaryEnabled) {
    return;
  }

  if (!context?.sessionActive) {
    return;
  }

  const hasPermission = await ensurePermissionsAsync();
  if (!hasPermission) return;

  const fireDate = getNextDailySummaryFireDate();
  const body = buildDailySummaryBody(context.todaySpend);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily spending summary',
      body,
      data: { type: DAILY_SUMMARY_TYPE },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}
