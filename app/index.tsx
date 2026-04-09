/**
 * @module LandingScreen
 * @owner Navigation
 * @updates 2024-12-18 - Added auth-based redirect
 *
 * Landing page that redirects based on authentication state.
 */

import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect, Href } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingScreen() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  // Show loading while checking auth
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent.default} />
      </View>
    );
  }

  // Redirect to tabs if already authenticated
  if (user) {
    return <Redirect href={'/(tabs)' as Href} />;
  }

  // Redirect to login for unauthenticated users
  return <Redirect href={'/(auth)/login' as Href} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
