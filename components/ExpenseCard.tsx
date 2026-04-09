/**
 * @module ExpenseCard
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * Card component for displaying an expense in a list.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Layers } from 'lucide-react-native';
import { ExpenseWithCategory } from '../hooks/useExpenses';
import { colors, typography, spacing } from '../theme';
import { formatCurrency, formatRelativeDate } from '../lib/utils';
import { getCategoryIcon } from '../lib/categoryIcons';

interface ExpenseCardProps {
  expense: ExpenseWithCategory;
  onPress?: () => void;
}

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const categoryColor = expense.categories?.color || colors.text.muted;
  const categoryName = expense.categories?.name || 'Uncategorized';
  const categoryIcon = getCategoryIcon(categoryName, expense.categories?.icon);
  const hasSplitLines = (expense.expense_line_items?.length ?? 0) > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      testID={`expense-card-${expense.id}`}
    >
      {/* Category Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${categoryColor}20` },
        ]}
      >
        <Text style={styles.categoryEmoji}>{categoryIcon}</Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>
          {expense.merchant || 'Unknown Merchant'}
        </Text>
        <Text style={styles.category}>
          {categoryName} • {formatRelativeDate(expense.expense_date)}
        </Text>
      </View>

      {/* Amount + split hint */}
      <View style={styles.amountColumn}>
        {hasSplitLines ? (
          <View style={styles.splitBadge} accessibilityLabel="Split receipt">
            <Layers size={12} color={colors.accent.default} />
            <Text style={styles.splitBadgeText}>Split</Text>
          </View>
        ) : null}
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
    marginRight: spacing.sm,
  },
  merchant: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  category: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.accent.default}18`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  splitBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accent.default,
    fontWeight: '600',
  },
  amount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  categoryEmoji: {
    fontSize: 20,
  },
});
