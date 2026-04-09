/**
 * @module LoginScreen
 * @owner Authentication
 * @updates 2024-12-18 - Wired to AuthContext for real auth
 *
 * Login screen with email/password authentication via Supabase.
 */

import { View, Text, StyleSheet, TextInput, Pressable, Switch } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Wallet, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing } from '../../theme';
import {
  clearSavedEmail,
  loadDevicePreferences,
  loadSavedEmail,
  saveDevicePreferences,
  saveSavedEmail,
} from '../../lib/devicePreferences';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);

  const { signIn } = useAuth();

  useEffect(() => {
    const hydrateSavedEmail = async () => {
      const [savedEmail, devicePreferences] = await Promise.all([
        loadSavedEmail(),
        loadDevicePreferences(),
      ]);

      setRememberEmail(devicePreferences.rememberEmailEnabled);

      if (savedEmail && devicePreferences.rememberEmailEnabled) {
        setEmail(savedEmail);
      }
    };

    hydrateSavedEmail();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
      if (rememberEmail) {
        await saveSavedEmail(email.trim());
      } else {
        await clearSavedEmail();
      }
      const existingPreferences = await loadDevicePreferences();
      await saveDevicePreferences({
        ...existingPreferences,
        rememberEmailEnabled: rememberEmail,
      });
      router.replace('/(tabs)' as Href);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Wallet size={48} color={colors.accent.default} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your Cents account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              testID="email-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              testID="password-input"
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.text.muted} />
              ) : (
                <Eye size={20} color={colors.text.muted} />
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password' as Href)}
            style={styles.forgotLink}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchLabel}>Remember this email</Text>
              <Text style={styles.switchHint}>
                We only save your email on this device.
              </Text>
            </View>
            <Switch
              value={rememberEmail}
              onValueChange={async (value) => {
                setRememberEmail(value);
                const existingPreferences = await loadDevicePreferences();
                await saveDevicePreferences({
                  ...existingPreferences,
                  rememberEmailEnabled: value,
                });
                if (!value) {
                  await clearSavedEmail();
                }
              }}
              trackColor={{ false: colors.border, true: colors.accent.light }}
              thumbColor={rememberEmail ? colors.accent.default : colors.text.muted}
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            testID="login-button"
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/signup' as Href)}>
            <Text style={styles.linkText}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text.primary,
    ...typography.body,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchTextGroup: {
    flex: 1,
  },
  switchLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  switchHint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent.default,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent.default,
  },
});
