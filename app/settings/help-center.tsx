import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { ChevronLeft, CircleHelp, ExternalLink } from 'lucide-react-native';
import { spacing, typography } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

const HELP_LINKS = [
  {
    title: 'Cents Website',
    description: 'See the live web experience and latest updates.',
    url: 'https://cents-flax.vercel.app/',
  },
  {
    title: 'GitHub Repository',
    description: 'Browse source code, issues, and release history.',
    url: 'https://github.com/SamvritSrinath/cents',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How do notifications work right now?',
    a: 'Local notifications work in supported builds. Android Expo Go (SDK 53+) requires a dev build for notification testing.',
  },
  {
    q: 'How is saved sign-in handled?',
    a: 'Only your email can be remembered on this device. Passwords are never stored locally.',
  },
  {
    q: 'Can I customize categories?',
    a: 'Yes. You can add custom categories with color and emoji, then use them while creating expenses.',
  },
];

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <CircleHelp size={18} color={colors.accent.default} />
          <Text style={styles.heroText}>
            Need help or want to cross-check behavior? These resources stay in sync with Cents.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Resources</Text>
        {HELP_LINKS.map((item) => (
          <Pressable
            key={item.url}
            style={styles.linkCard}
            onPress={() => Linking.openURL(item.url)}
          >
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>{item.title}</Text>
              <Text style={styles.linkDescription}>{item.description}</Text>
            </View>
            <ExternalLink size={16} color={colors.text.muted} />
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>FAQ</Text>
        {FAQ_ITEMS.map((item) => (
          <View key={item.q} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{item.q}</Text>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        ))}
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
  heroCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.sm,
  },
  linkCard: {
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
  linkCopy: {
    flex: 1,
  },
  linkTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  linkDescription: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  faqQuestion: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  faqAnswer: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  });
}
