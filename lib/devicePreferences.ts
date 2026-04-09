import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  notificationsEnabled: 'cents.notificationsEnabled',
  receiptAlertsEnabled: 'cents.receiptAlertsEnabled',
  dailySummaryEnabled: 'cents.dailySummaryEnabled',
  rememberEmailEnabled: 'cents.rememberEmailEnabled',
  defaultCurrency: 'cents.defaultCurrency',
  themePreference: 'cents.themePreference',
  savedEmail: 'cents.savedEmail',
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';

export interface DevicePreferences {
  notificationsEnabled: boolean;
  receiptAlertsEnabled: boolean;
  dailySummaryEnabled: boolean;
  rememberEmailEnabled: boolean;
  defaultCurrency: string;
  themePreference: ThemePreference;
}

const DEFAULT_PREFERENCES: DevicePreferences = {
  notificationsEnabled: true,
  receiptAlertsEnabled: true,
  dailySummaryEnabled: false,
  rememberEmailEnabled: true,
  defaultCurrency: 'USD',
  themePreference: 'dark',
};

export async function loadDevicePreferences(): Promise<DevicePreferences> {
  const stored = await AsyncStorage.multiGet([
    STORAGE_KEYS.notificationsEnabled,
    STORAGE_KEYS.receiptAlertsEnabled,
    STORAGE_KEYS.dailySummaryEnabled,
    STORAGE_KEYS.rememberEmailEnabled,
    STORAGE_KEYS.defaultCurrency,
    STORAGE_KEYS.themePreference,
  ]);

  const map = Object.fromEntries(stored);
  const rawThemePreference = map[STORAGE_KEYS.themePreference] || '';

  return {
    notificationsEnabled:
      map[STORAGE_KEYS.notificationsEnabled] !== undefined
        ? map[STORAGE_KEYS.notificationsEnabled] === 'true'
        : DEFAULT_PREFERENCES.notificationsEnabled,
    receiptAlertsEnabled:
      map[STORAGE_KEYS.receiptAlertsEnabled] !== undefined
        ? map[STORAGE_KEYS.receiptAlertsEnabled] === 'true'
        : DEFAULT_PREFERENCES.receiptAlertsEnabled,
    dailySummaryEnabled:
      map[STORAGE_KEYS.dailySummaryEnabled] !== undefined
        ? map[STORAGE_KEYS.dailySummaryEnabled] === 'true'
        : DEFAULT_PREFERENCES.dailySummaryEnabled,
    rememberEmailEnabled:
      map[STORAGE_KEYS.rememberEmailEnabled] !== undefined
        ? map[STORAGE_KEYS.rememberEmailEnabled] === 'true'
        : DEFAULT_PREFERENCES.rememberEmailEnabled,
    defaultCurrency:
      map[STORAGE_KEYS.defaultCurrency] || DEFAULT_PREFERENCES.defaultCurrency,
    themePreference:
      rawThemePreference === 'light' ||
      rawThemePreference === 'dark' ||
      rawThemePreference === 'system'
        ? rawThemePreference
        : DEFAULT_PREFERENCES.themePreference,
  };
}

export async function saveDevicePreferences(
  preferences: DevicePreferences
): Promise<void> {
  await AsyncStorage.multiSet([
    [
      STORAGE_KEYS.notificationsEnabled,
      String(preferences.notificationsEnabled),
    ],
    [
      STORAGE_KEYS.receiptAlertsEnabled,
      String(preferences.receiptAlertsEnabled),
    ],
    [STORAGE_KEYS.dailySummaryEnabled, String(preferences.dailySummaryEnabled)],
    [
      STORAGE_KEYS.rememberEmailEnabled,
      String(preferences.rememberEmailEnabled),
    ],
    [STORAGE_KEYS.defaultCurrency, preferences.defaultCurrency],
    [STORAGE_KEYS.themePreference, preferences.themePreference],
  ]);
}

export async function loadSavedEmail(): Promise<string> {
  return (await SecureStore.getItemAsync(STORAGE_KEYS.savedEmail)) || '';
}

export async function saveSavedEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.savedEmail, email);
}

export async function clearSavedEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.savedEmail);
}
