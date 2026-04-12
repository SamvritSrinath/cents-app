/**
 * @module ExpensesScreen
 * @owner Expenses
 * @updates 2026-04-11 - SectionList by month, default last 30 days with optional older data
 *
 * Expenses list with infinite scroll, month sections, and add expense FAB.
 */

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Plus, Receipt } from 'lucide-react-native';
import { ExpenseCard } from '../../components/ExpenseCard';
import { useExpenses, ExpenseWithCategory } from '../../hooks/useExpenses';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';
import { toLocalISODateString } from '../../lib/utils';

function formatExpenseMonthTitle(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

type ExpenseSection = { title: string; data: ExpenseWithCategory[] };

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [includeOlder, setIncludeOlder] = useState(false);

  const expenseFilters = useMemo(() => {
    if (includeOlder) return undefined;
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { startDate: toLocalISODateString(start) };
  }, [includeOlder]);

  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom]
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useExpenses(expenseFilters);

  const expenses = data?.pages.flat() || [];

  const sections: ExpenseSection[] = useMemo(() => {
    const groups = new Map<string, ExpenseWithCategory[]>();
    for (const e of expenses) {
      const key = e.expense_date.slice(0, 7);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    const keys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));
    return keys.map((key) => ({
      title: formatExpenseMonthTitle(key),
      data: groups.get(key)!,
    }));
  }, [expenses]);

  const handleExpensePress = (expense: ExpenseWithCategory) => {
    router.push(`/expenses/${expense.id}` as Href);
  };

  const handleAddExpense = () => {
    router.push('/expenses/create' as Href);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderExpense = ({ item }: { item: ExpenseWithCategory }) => (
    <ExpenseCard expense={item} onPress={() => handleExpensePress(item)} />
  );

  const renderSectionHeader = ({ section }: { section: ExpenseSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent.default} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Receipt size={48} color={colors.text.muted} />
      <Text style={styles.emptyText}>No expenses in this range</Text>
      <Text style={styles.emptySubtext}>
        {includeOlder
          ? 'Add an expense or pull to refresh.'
          : 'Try including older expenses, or add new ones with +.'}
      </Text>
    </View>
  );

  const listHeader = (
    <View style={styles.filterBanner}>
      <Text style={styles.filterBannerText}>
        {includeOlder ? 'All time (paginated)' : 'Last 30 days'}
      </Text>
      <Pressable
        onPress={() => setIncludeOlder((v) => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          includeOlder ? 'Show last 30 days only' : 'Include older expenses'
        }
      >
        <Text style={styles.filterBannerAction}>
          {includeOlder ? 'Last 30 days only' : 'Include older'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.default} />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load expenses</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderExpense}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={[
            styles.listContent,
            sections.length === 0 && styles.emptyListContent,
          ]}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent.default}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={handleAddExpense}
        testID="add-expense-fab"
      >
        <Plus size={24} color={colors.background} />
      </Pressable>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, bottomInset: number) {
  const fabBottom = spacing.lg + bottomInset;
  const listPadBottom = spacing.xxl + 56 + spacing.lg + bottomInset;
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
    filterBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterBannerText: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    filterBannerAction: {
      ...typography.caption,
      color: colors.accent.default,
      fontWeight: '700',
    },
    sectionHeader: {
      backgroundColor: colors.background,
      paddingVertical: spacing.sm,
      paddingHorizontal: 0,
    },
    sectionHeaderText: {
      ...typography.caption,
      color: colors.text.muted,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorText: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    retryButton: {
      backgroundColor: colors.accent.default,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
    },
    retryButtonText: {
      ...typography.body,
      color: colors.background,
      fontWeight: '600',
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: listPadBottom,
    },
    emptyListContent: {
      flexGrow: 1,
    },
    emptyState: {
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      ...typography.heading3,
      color: colors.text.secondary,
      marginTop: spacing.md,
    },
    emptySubtext: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    footerLoader: {
      paddingVertical: spacing.md,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: fabBottom,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent.default,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
  });
}
