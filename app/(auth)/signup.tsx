/**
 * @module SignupScreen
 * @owner Authentication
 * @updates 2024-12-18 - Initial signup screen implementation
 *
 * Sign up screen with email/password registration via Supabase.
 */

import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Wallet, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { typography, spacing } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function SignupScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await signUp(email.trim(), password);
      setSuccess(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Sign up failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Wallet size={48} color={colors.accent.default} />
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a confirmation link to {email}
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.replace('/(auth)/login' as Href)}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Wallet size={48} color={colors.accent.default} />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start tracking your expenses</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
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

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={colors.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            testID="confirm-password-input"
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            testID="signup-button"
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/(auth)/login' as Href)}>
            <Text style={styles.linkText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: -spacing.xxl,
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
}
