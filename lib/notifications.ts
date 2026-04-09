import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DevicePreferences } from './devicePreferences';

const DAILY_SUMMARY_TYPE = 'daily_summary';

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
    // Lazy-load to avoid crashing on unsupported runtimes (Expo Go on Android).
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

export async function syncNotificationSchedulesAsync(
  preferences: DevicePreferences
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  const plan = getNotificationPlan(preferences);

  if (plan.cancelAll) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const dailySummaryScheduled = scheduled.filter(
    (notification) => notification.content?.data?.type === DAILY_SUMMARY_TYPE
  );

  if (!plan.dailySummaryEnabled && dailySummaryScheduled.length > 0) {
    await Promise.all(
      dailySummaryScheduled.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
    return;
  }

  if (plan.dailySummaryEnabled && dailySummaryScheduled.length === 0) {
    const hasPermission = await ensurePermissionsAsync();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily spending summary',
        body: 'Open Cents to review today\'s expenses.',
        data: { type: DAILY_SUMMARY_TYPE },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  }
}
