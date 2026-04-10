/**
 * @module AuthLayout
 * @owner Authentication
 * @updates 2024-12-18 - Initial auth route group layout
 *
 * Layout for authentication screens (login, signup, forgot-password).
 * Provides a centered, non-tabbed layout for auth flows.
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
