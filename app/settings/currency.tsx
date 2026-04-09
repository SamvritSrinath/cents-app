import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, ChevronLeft, Coins } from 'lucide-react-native';
import {
  loadDevicePreferences,
  saveDevicePreferences,
} from '../../lib/devicePreferences';
import { CURRENCIES, getCurrencyLabel } from '../../lib/settingsOptions';
import { spacing, typography } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function CurrencySettingsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    const hydrate = async () => {
      const preferences = await loadDevicePreferences();
      setSelectedCurrency(preferences.defaultCurrency);
      setLoading(false);
    };

    hydrate();
  }, []);

  const handleSelect = async (currencyCode: string) => {
    const existing = await loadDevicePreferences();
    await saveDevicePreferences({
      ...existing,
      defaultCurrency: currencyCode,
    });
    setSelectedCurrency(currencyCode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Default Currency</Text>
      </View>

      <View style={styles.subtitleRow}>
        <Coins size={16} color={colors.text.muted} />
        <Text style={styles.subtitle}>
          Your default currency is used for totals and summary displays.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.accent.default} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {CURRENCIES.map((currency) => {
            const selected = currency.code === selectedCurrency;
            return (
              <Pressable
                key={currency.code}
                style={[styles.item, selected && styles.itemSelected]}
                onPress={() => handleSelect(currency.code)}
              >
                <Text style={styles.itemText}>
                  {getCurrencyLabel(currency.code)}
                </Text>
                {selected ? (
                  <Check size={18} color={colors.accent.default} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
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
    itemText: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
  });
}
