import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, ChevronLeft, Palette } from 'lucide-react-native';
import { ThemePreference } from '../../lib/devicePreferences';
import { THEME_OPTIONS } from '../../lib/settingsOptions';
import { spacing, typography } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSettingsScreen() {
  const { preference, setThemePreference, colors, loading } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('dark');

  useEffect(() => {
    setSelectedTheme(preference);
  }, [preference]);

  const handleSelect = async (themePreference: ThemePreference) => {
    await setThemePreference(themePreference);
    setSelectedTheme(themePreference);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Theme</Text>
      </View>

      <View style={styles.subtitleRow}>
        <Palette size={16} color={colors.text.muted} />
        <Text style={styles.subtitle}>
          Pick your style. System follows your device appearance.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.accent.default} />
        </View>
      ) : (
        <View style={styles.list}>
          {THEME_OPTIONS.map((option) => {
            const selected = selectedTheme === option.key;
            return (
              <Pressable
                key={option.key}
                style={[styles.item, selected && styles.itemSelected]}
                onPress={() => handleSelect(option.key)}
              >
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{option.label}</Text>
                  <Text style={styles.itemDescription}>
                    {option.description}
                  </Text>
                </View>
                {selected ? (
                  <Check size={18} color={colors.accent.default} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    backButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      ...typography.heading3,
      color: colors.text.primary,
    },
    subtitleRow: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    subtitle: {
      ...typography.caption,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 18,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    item: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    itemSelected: {
      borderColor: colors.accent.default,
    },
    itemCopy: {
      flex: 1,
    },
    itemTitle: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '600',
    },
    itemDescription: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: 2,
    },
  });
}
