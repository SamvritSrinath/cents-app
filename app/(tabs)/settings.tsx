import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import {
  User,
  LogOut,
  ChevronRight,
  Bell,
  Palette,
  HelpCircle,
  Info,
  Check,
  X,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { typography, spacing } from '../../theme';
import { AppColors } from '../../theme/colors';
import {
  clearSavedEmail,
  DevicePreferences,
  loadDevicePreferences,
  loadSavedEmail,
  saveDevicePreferences,
} from '../../lib/devicePreferences';
import { THEME_OPTIONS, getCurrencyLabel } from '../../lib/settingsOptions';
import { getUserDisplayName } from '../../lib/userProfile';
import {
  isLocalNotificationsSupported,
  scheduleTestNotificationAsync,
} from '../../lib/notifications';
import { syncNotificationsForCurrentSessionAsync } from '../../lib/notificationSessionSync';
import { uploadProfileAvatarAsync } from '../../lib/avatarUpload';
import * as ImagePicker from 'expo-image-picker';

interface SettingsItemProps {
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  value?: string;
  trailing?: React.ReactNode;
}

function SettingsItem({
  colors,
  styles,
  icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
  value,
  trailing,
}: SettingsItemProps) {
  return (
    <Pressable style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        {icon}
        <Text style={[styles.settingsItemLabel, danger && styles.dangerText]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {trailing}
        {!trailing && value && (
          <Text style={styles.settingsItemValue}>{value}</Text>
        )}
        {!trailing && showChevron && (
          <ChevronRight size={20} color={colors.text.muted} />
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const { data: profile, updateProfile, isUpdating } = useProfile();
  const styles = createStyles(colors);
  const notificationsSupported = isLocalNotificationsSupported();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.display_name || '');
  const [savedEmail, setSavedEmail] = useState('');
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [preferences, setPreferences] = useState<DevicePreferences>({
    notificationsEnabled: true,
    receiptAlertsEnabled: true,
    dailySummaryEnabled: false,
    rememberEmailEnabled: true,
    defaultCurrency: 'USD',
    themePreference: 'dark',
  });

  const hydratePreferences = useCallback(async () => {
    const [devicePrefs, email] = await Promise.all([
      loadDevicePreferences(),
      loadSavedEmail(),
    ]);

    setPreferences(devicePrefs);
    setSavedEmail(email);
    setPreferencesLoading(false);
  }, []);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  useFocusEffect(
    useCallback(() => {
      hydratePreferences();
    }, [hydratePreferences])
  );

  useEffect(() => {
    if (profile?.display_name && !isEditing) {
      setNewName(profile.display_name);
    }
  }, [profile?.display_name, isEditing]);

  const updatePreferences = async (nextPreferences: DevicePreferences) => {
    setPreferences(nextPreferences);
    await saveDevicePreferences(nextPreferences);
    await syncNotificationsForCurrentSessionAsync(nextPreferences, user);

    if (!nextPreferences.rememberEmailEnabled) {
      await clearSavedEmail();
      setSavedEmail('');
    }
  };

  const handleUpdateName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a name before saving.');
      return;
    }

    try {
      await updateProfile({ display_name: trimmed });
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update name';
      Alert.alert('Error', message);
    }
  };

  const handlePickAvatar = async () => {
    if (!user?.id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photos',
        'Allow photo access in Settings to set a profile picture.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    setAvatarUploading(true);
    try {
      const publicUrl = await uploadProfileAvatarAsync(
        user.id,
        result.assets[0].uri
      );
      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Could not upload photo.';
      Alert.alert(
        'Avatar upload',
        `${msg}\n\nCreate a public Storage bucket named "avatars" in Supabase (see docs/guide/getting-started.md) if you have not yet.`
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login' as Href);
          } catch {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <Pressable
              onPress={() => void handlePickAvatar()}
              disabled={avatarUploading}
              style={styles.avatar}
              accessibilityLabel="Change profile photo"
            >
              {avatarUploading ? (
                <ActivityIndicator size="small" color={colors.accent.default} />
              ) : profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={32} color={colors.text.secondary} />
              )}
            </Pressable>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Full Name"
                    placeholderTextColor={colors.text.muted}
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <Pressable
                      onPress={handleUpdateName}
                      style={styles.editActionButton}
                    >
                      {isUpdating ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.accent.default}
                        />
                      ) : (
                        <Check size={20} color={colors.accent.default} />
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setIsEditing(false);
                        setNewName(profile?.display_name || '');
                      }}
                      style={styles.editActionButton}
                    >
                      <X size={20} color={colors.semantic.error} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setIsEditing(true);
                    setNewName(profile?.display_name || '');
                  }}
                  style={styles.namePressable}
                >
                  <Text style={styles.profileName}>
                    {getUserDisplayName(user, profile?.display_name)}
                  </Text>
                  <Text style={styles.editLabel}>Tap to edit</Text>
                </Pressable>
              )}
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>General</Text>
          <View style={styles.card}>
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<SettingsIcon size={20} color={colors.text.secondary} />}
              label="Default Currency"
              value={getCurrencyLabel(preferences.defaultCurrency)}
              onPress={() => router.push('/settings/currency' as Href)}
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<Palette size={20} color={colors.text.secondary} />}
              label="Theme"
              value={
                THEME_OPTIONS.find(
                  (option) => option.key === preferences.themePreference
                )?.label || 'Dark'
              }
              onPress={() => router.push('/settings/theme' as Href)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.card}>
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<Bell size={20} color={colors.text.secondary} />}
              label="Enable notifications"
              showChevron={false}
              trailing={
                <Switch
                  value={preferences.notificationsEnabled}
                  onValueChange={(value) =>
                    updatePreferences({
                      ...preferences,
                      notificationsEnabled: value,
                    })
                  }
                  disabled={preferencesLoading}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent.dark,
                  }}
                  thumbColor={
                    preferences.notificationsEnabled
                      ? colors.accent.default
                      : colors.text.muted
                  }
                />
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<Bell size={20} color={colors.text.secondary} />}
              label="Receipt reminders"
              showChevron={false}
              trailing={
                <Switch
                  value={preferences.receiptAlertsEnabled}
                  onValueChange={(value) =>
                    updatePreferences({
                      ...preferences,
                      receiptAlertsEnabled: value,
                    })
                  }
                  disabled={preferencesLoading}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent.dark,
                  }}
                  thumbColor={
                    preferences.receiptAlertsEnabled
                      ? colors.accent.default
                      : colors.text.muted
                  }
                />
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<Bell size={20} color={colors.text.secondary} />}
              label="Daily summary"
              showChevron={false}
              trailing={
                <Switch
                  value={preferences.dailySummaryEnabled}
                  onValueChange={(value) =>
                    updatePreferences({
                      ...preferences,
                      dailySummaryEnabled: value,
                    })
                  }
                  disabled={preferencesLoading}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent.dark,
                  }}
                  thumbColor={
                    preferences.dailySummaryEnabled
                      ? colors.accent.default
                      : colors.text.muted
                  }
                />
              }
            />
            <Text style={styles.sectionHint}>
              {notificationsSupported
                ? 'Notifications are local and Expo Go friendly. Daily summary runs at 8:00 PM.'
                : 'Notifications are unavailable in Android Expo Go (SDK 53+). Use a dev build to test alerts.'}
            </Text>
            <Pressable
              style={[
                styles.testNotificationButton,
                !notificationsSupported &&
                  styles.testNotificationButtonDisabled,
              ]}
              onPress={async () => {
                if (!notificationsSupported) {
                  Alert.alert(
                    'Not supported in Expo Go',
                    'Android Expo Go does not support notifications. Use a development build.'
                  );
                  return;
                }

                const canNotify = await scheduleTestNotificationAsync();
                if (!canNotify) {
                  Alert.alert(
                    'Notifications disabled',
                    'Enable notification permissions in system settings.'
                  );
                  return;
                }

                Alert.alert(
                  'Notification queued',
                  'A test notification was sent.'
                );
              }}
            >
              <Text style={styles.testNotificationButtonText}>
                Send test notification
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Auth Methods</Text>
          <View style={styles.card}>
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<SettingsIcon size={20} color={colors.text.secondary} />}
              label="Email/password"
              value="Enabled"
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<SettingsIcon size={20} color={colors.text.secondary} />}
              label="Remember email on this device"
              showChevron={false}
              trailing={
                <Switch
                  value={preferences.rememberEmailEnabled}
                  onValueChange={(value) =>
                    updatePreferences({
                      ...preferences,
                      rememberEmailEnabled: value,
                    })
                  }
                  disabled={preferencesLoading}
                  trackColor={{
                    false: colors.border,
                    true: colors.accent.dark,
                  }}
                  thumbColor={
                    preferences.rememberEmailEnabled
                      ? colors.accent.default
                      : colors.text.muted
                  }
                />
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<User size={20} color={colors.text.secondary} />}
              label="Saved sign-in"
              value={
                preferences.rememberEmailEnabled
                  ? savedEmail || 'None saved'
                  : 'Disabled'
              }
              showChevron={false}
            />
            <Pressable
              style={styles.clearSavedButton}
              onPress={async () => {
                await clearSavedEmail();
                setSavedEmail('');
                Alert.alert('Saved sign-in cleared');
              }}
              disabled={!savedEmail}
            >
              <Text
                style={[
                  styles.clearSavedButtonText,
                  !savedEmail && styles.clearSavedButtonTextDisabled,
                ]}
              >
                Clear saved sign-in
              </Text>
            </Pressable>
            <Text style={styles.sectionHint}>
              Saved sign-in only remembers your email on this device
              (SecureStore) to pre-fill the login screen. It never stores your
              password.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.card}>
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<HelpCircle size={20} color={colors.text.secondary} />}
              label="Help Center"
              onPress={() => router.push('/settings/help-center' as Href)}
            />
            <View style={styles.divider} />
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<Info size={20} color={colors.text.secondary} />}
              label="About Cents"
              onPress={() => router.push('/settings/about' as Href)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <SettingsItem
              colors={colors}
              styles={styles}
              icon={<LogOut size={20} color={colors.semantic.error} />}
              label="Sign Out"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>
        </View>

        <Text style={styles.version}>
          Cents v{Constants.expoConfig?.version ?? '0.0.0'}
        </Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...typography.heading1,
      color: colors.text.primary,
    },
    section: {
      padding: spacing.md,
      paddingBottom: 0,
    },
    sectionLabel: {
      ...typography.caption,
      color: colors.text.muted,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    sectionHint: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.sm,
      lineHeight: 18,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    testNotificationButton: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      backgroundColor: `${colors.accent.default}20`,
      borderWidth: 1,
      borderColor: `${colors.accent.default}55`,
    },
    testNotificationButtonText: {
      ...typography.caption,
      color: colors.accent.default,
      fontWeight: '600',
    },
    testNotificationButtonDisabled: {
      opacity: 0.5,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    profileInfo: {
      marginLeft: spacing.md,
      flex: 1,
    },
    profileName: {
      ...typography.heading3,
      color: colors.text.primary,
    },
    profileEmail: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    settingsItemLabel: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    settingsItemValue: {
      ...typography.caption,
      color: colors.text.muted,
    },
    dangerText: {
      color: colors.semantic.error,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: spacing.md + 20 + spacing.md,
    },
    editNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    nameInput: {
      ...typography.heading3,
      color: colors.text.primary,
      flex: 1,
      padding: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.accent.default,
    },
    editActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    editActionButton: {
      padding: spacing.xs,
    },
    namePressable: {
      flexDirection: 'column',
    },
    editLabel: {
      ...typography.caption,
      color: colors.accent.default,
      fontSize: 10,
      marginTop: 2,
    },
    clearSavedButton: {
      marginTop: spacing.xs,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    clearSavedButtonText: {
      ...typography.caption,
      color: colors.semantic.error,
      fontWeight: '600',
    },
    clearSavedButtonTextDisabled: {
      opacity: 0.4,
    },
    version: {
      ...typography.caption,
      color: colors.text.muted,
      textAlign: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    bottomSpacer: {
      height: spacing.xl,
    },
  });
}
