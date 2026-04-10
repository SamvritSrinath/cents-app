import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  loadDevicePreferences,
  saveDevicePreferences,
  ThemePreference,
} from '../lib/devicePreferences';
import { AppColors, getColorsForTheme, ResolvedTheme } from '../theme/colors';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  colors: AppColors;
  loading: boolean;
  setThemePreference: (nextPreference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateTheme = async () => {
      const preferences = await loadDevicePreferences();
      setPreference(preferences.themePreference);
      setLoading(false);
    };

    hydrateTheme();
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return preference;
  }, [preference, systemScheme]);

  const setThemePreference = useCallback(
    async (nextPreference: ThemePreference) => {
      const existing = await loadDevicePreferences();
      await saveDevicePreferences({
        ...existing,
        themePreference: nextPreference,
      });
      setPreference(nextPreference);
    },
    []
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme,
      colors: getColorsForTheme(resolvedTheme),
      loading,
      setThemePreference,
    }),
    [preference, resolvedTheme, loading, setThemePreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
