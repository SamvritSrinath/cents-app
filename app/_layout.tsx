/**
 * @module RootLayout
 * @owner Navigation
 * @updates 2024-12-18 - Added AuthProvider wrapper
 *
 * Root layout that provides global providers and navigation structure.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BuildConfigMissingScreen } from '../components/BuildConfigMissingScreen';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { isMissingSupabasePublicEnv } from '../lib/buildConfig';
import { NotificationPreferenceSync } from '../components/NotificationPreferenceSync';

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

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <NotificationPreferenceSync />
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
  if (!__DEV__ && isMissingSupabasePublicEnv()) {
    return (
      <SafeAreaProvider>
        <BuildConfigMissingScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

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
