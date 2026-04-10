import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { ChevronLeft, Wallet } from 'lucide-react-native';
import { spacing, typography } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export default function AboutScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>About Cents</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandCard}>
          <View style={styles.brandIcon}>
            <Wallet size={24} color={colors.accent.default} />
          </View>
          <Text style={styles.brandTitle}>Cents</Text>
          <Text style={styles.brandSubtitle}>
            Expense tracking that stays simple, secure, and fast.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>v{APP_VERSION}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Built for</Text>
          <Text style={styles.infoValue}>Reliable daily expense tracking</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Data</Text>
          <Text style={styles.infoValue}>
            Auth and data are managed with Supabase and per-user access
            controls.
          </Text>
        </View>
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
    content: {
      padding: spacing.md,
      gap: spacing.md,
    },
    brandCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    brandIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.accent.default}20`,
    },
    brandTitle: {
      ...typography.heading2,
      color: colors.text.primary,
    },
    brandSubtitle: {
      ...typography.caption,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.md,
      gap: spacing.xs,
    },
    infoLabel: {
      ...typography.caption,
      color: colors.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    infoValue: {
      ...typography.body,
      color: colors.text.primary,
    },
  });
}
