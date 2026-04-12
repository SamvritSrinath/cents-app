/**
 * @module DashboardScreen
 * @owner Dashboard
 * @updates 2024-12-31 - Connected to Supabase with real data and charts
 *
 * Main dashboard showing spending summary, charts, and recent transactions.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router, Href, useFocusEffect } from 'expo-router';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import {
  useDashboardStats,
  useSpendingByCategory,
  useSpendingTrend,
  useRecentExpenses,
  useWeekComparison,
  useTopMerchants,
} from '../../hooks/useDashboard';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { ExpenseCard } from '../../components/ExpenseCard';
import { typography, spacing } from '../../theme';
import { AppColors } from '../../theme/colors';
import { formatCurrency } from '../../lib/utils';
import { loadDevicePreferences } from '../../lib/devicePreferences';
import { getUserDisplayName } from '../../lib/userProfile';

const TAB_BAR_REGION = 60;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();
  const styles = createStyles(colors);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();
  const { data: categoryData, refetch: refetchCategory } =
    useSpendingByCategory();
  const { data: trendData, refetch: refetchTrend } = useSpendingTrend(6);
  const { data: recentExpenses, refetch: refetchRecent } = useRecentExpenses(5);
  const { data: weekStats, refetch: refetchWeek } = useWeekComparison();
  const { data: topMerchants, refetch: refetchMerchants } = useTopMerchants(5);

  const isLoading = statsLoading;
  const isRefreshing = false;

  const handleRefresh = () => {
    refetchStats();
    refetchCategory();
    refetchTrend();
    refetchRecent();
    refetchWeek();
    refetchMerchants();
  };

  const handleViewAllExpenses = () => {
    router.push('/(tabs)/expenses' as Href);
  };

  const handleExpensePress = (id: string) => {
    router.push(`/expenses/${id}` as Href);
  };

  const handleAddExpense = () => {
    router.push('/expenses/create' as Href);
  };

  const monthlySpending = stats?.thisMonth ?? 0;
  const monthlyChange = stats?.changePercent ?? 0;

  const hydratePreferences = useCallback(async () => {
    const preferences = await loadDevicePreferences();
    setDefaultCurrency(preferences.defaultCurrency);
  }, []);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  useFocusEffect(
    useCallback(() => {
      hydratePreferences();
    }, [hydratePreferences])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.default}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {getUserDisplayName(user, profile?.display_name)}!
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Spending Summary Card */}
        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.accent.default} />
            </View>
          ) : (
            <>
              <Text style={styles.cardLabel}>This Month</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(monthlySpending, defaultCurrency)}
              </Text>
              <View style={styles.changeRow}>
                {monthlyChange <= 0 ? (
                  <TrendingDown size={16} color={colors.semantic.success} />
                ) : (
                  <TrendingUp size={16} color={colors.semantic.error} />
                )}
                <Text
                  style={[
                    styles.changeText,
                    {
                      color:
                        monthlyChange <= 0
                          ? colors.semantic.success
                          : colors.semantic.error,
                    },
                  ]}
                >
                  {Math.abs(monthlyChange).toFixed(1)}% vs last month
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.rowCards}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Last 7 days</Text>
            <Text style={styles.cardAmountSmall}>
              {formatCurrency(weekStats?.thisWeek ?? 0, defaultCurrency)}
            </Text>
            <View style={styles.changeRow}>
              {(weekStats?.changePercent ?? 0) <= 0 ? (
                <TrendingDown size={14} color={colors.semantic.success} />
              ) : (
                <TrendingUp size={14} color={colors.semantic.error} />
              )}
              <Text
                style={[
                  styles.changeTextSmall,
                  {
                    color:
                      (weekStats?.changePercent ?? 0) <= 0
                        ? colors.semantic.success
                        : colors.semantic.error,
                  },
                ]}
              >
                {Math.abs(weekStats?.changePercent ?? 0).toFixed(1)}% vs prior
                7d
              </Text>
            </View>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardLabel}>Prior 7 days</Text>
            <Text style={styles.cardAmountSmall}>
              {formatCurrency(weekStats?.lastWeek ?? 0, defaultCurrency)}
            </Text>
            <Text style={styles.cardSubMuted}>Comparison window</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top vendors (this month)</Text>
          <View style={styles.chartCard}>
            {!topMerchants || topMerchants.length === 0 ? (
              <Text style={styles.emptyInline}>
                No merchant data for this month yet.
              </Text>
            ) : (
              topMerchants.map((m) => (
                <View key={m.merchant} style={styles.merchantRow}>
                  <Text style={styles.merchantName} numberOfLines={1}>
                    {m.merchant}
                  </Text>
                  <Text style={styles.merchantAmount}>
                    {formatCurrency(m.amount, defaultCurrency)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Spending Trend Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>
            Spending Trend
          </Text>
          <Text style={styles.sectionSubtitle}>
            Total spend per month · last 6 months
          </Text>
          <View style={styles.chartCard}>
            <SpendingTrendChart
              data={trendData || []}
              height={200}
              currency={defaultCurrency}
            />
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <View style={styles.chartCard}>
            <CategoryPieChart
              data={categoryData || []}
              currency={defaultCurrency}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable
              onPress={handleViewAllExpenses}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={colors.accent.default} />
            </Pressable>
          </View>

          {!recentExpenses || recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first expense to get started
              </Text>
              <Pressable
                style={styles.primaryButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.primaryButtonText}>Add Expense</Text>
              </Pressable>
            </View>
          ) : (
            recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => handleExpensePress(expense.id)}
              />
            ))
          )}
        </View>

        {/* Bottom spacing — tab bar + home indicator */}
        <View
          style={{ height: spacing.xxl + TAB_BAR_REGION + insets.bottom }}
        />
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
    scrollView: {
      flex: 1,
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    greeting: {
      ...typography.heading1,
      color: colors.text.primary,
    },
    date: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingCard: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    cardLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    rowCards: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    halfCard: {
      flex: 1,
      marginBottom: 0,
      padding: spacing.md,
    },
    cardAmountSmall: {
      ...typography.heading2,
      color: colors.text.primary,
      marginTop: spacing.xs,
    },
    changeTextSmall: {
      ...typography.caption,
      marginLeft: spacing.xs,
    },
    cardSubMuted: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
    merchantRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    merchantName: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
      marginRight: spacing.md,
    },
    merchantAmount: {
      ...typography.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    emptyInline: {
      ...typography.caption,
      color: colors.text.muted,
      paddingVertical: spacing.md,
    },
    cardAmount: {
      ...typography.heading1,
      color: colors.text.primary,
      marginTop: spacing.xs,
      fontSize: 36,
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    changeText: {
      ...typography.caption,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.heading3,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    sectionTitleCompact: {
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      ...typography.caption,
      color: colors.text.muted,
      marginBottom: spacing.md,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      ...typography.caption,
      color: colors.accent.default,
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      ...typography.body,
      color: colors.text.secondary,
    },
    emptySubtext: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
    primaryButton: {
      marginTop: spacing.md,
      backgroundColor: colors.accent.default,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: 10,
    },
    primaryButtonText: {
      ...typography.body,
      color: colors.background,
      fontWeight: '600',
    },
  });
}
