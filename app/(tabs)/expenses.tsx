/**
 * @module ExpensesScreen
 * @owner Expenses
 * @updates 2024-12-31 - Connected to Supabase with real expense data
 *
 * Expenses list screen with infinite scroll and add expense FAB.
 */

import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
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

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
  } = useExpenses();

  // Flatten paginated data
  const expenses = data?.pages.flat() || [];

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
      <Text style={styles.emptyText}>No expenses yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the + button to add your first expense
      </Text>
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
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            expenses.length === 0 && styles.emptyListContent,
          ]}
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

      {/* Floating Action Button */}
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
      flex: 1,
      justifyContent: 'center',
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
