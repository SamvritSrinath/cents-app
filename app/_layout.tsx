/**
 * @module RootLayout
 * @owner Navigation
 * @updates 2024-12-18 - Added AuthProvider wrapper
 *
 * Root layout that provides global providers and navigation structure.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { loadDevicePreferences } from '../lib/devicePreferences';
import { syncNotificationSchedulesAsync } from '../lib/notifications';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function RootNavigator() {
  const { resolvedTheme, colors } = useTheme();
  const baseTheme = resolvedTheme === 'light' ? MD3LightTheme : MD3DarkTheme;
  const paperTheme = {
    ...baseTheme,
    dark: resolvedTheme === 'dark',
    colors: {
      ...baseTheme.colors,
      primary: colors.accent.default,
      background: colors.background,
      surface: colors.card,
      surfaceVariant: colors.border,
      onSurface: colors.text.primary,
      onSurfaceVariant: colors.text.secondary,
      error: colors.semantic.error,
    },
  };

  useEffect(() => {
    const syncNotificationState = async () => {
      const preferences = await loadDevicePreferences();
      await syncNotificationSchedulesAsync(preferences);
    };

    syncNotificationState();
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <StatusBar style={resolvedTheme === 'light' ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </AuthProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
