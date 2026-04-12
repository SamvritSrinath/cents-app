import { getNotificationPlan } from './notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
}));

describe('getNotificationPlan', () => {
  it('cancels all notifications when notifications are disabled', () => {
    const plan = getNotificationPlan({
      notificationsEnabled: false,
      receiptAlertsEnabled: true,
      dailySummaryEnabled: true,
      rememberEmailEnabled: true,
      defaultCurrency: 'USD',
      themePreference: 'dark',
    });

    expect(plan).toEqual({ cancelAll: true, dailySummaryEnabled: false });
  });

  it('enables daily summary only when global notifications are on', () => {
    const plan = getNotificationPlan({
      notificationsEnabled: true,
      receiptAlertsEnabled: true,
      dailySummaryEnabled: true,
      rememberEmailEnabled: true,
      defaultCurrency: 'USD',
      themePreference: 'dark',
    });

    expect(plan).toEqual({ cancelAll: false, dailySummaryEnabled: true });
  });
});
