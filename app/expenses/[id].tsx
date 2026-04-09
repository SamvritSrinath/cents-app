/**
 * @module ExpenseDetailScreen
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * Screen for viewing and editing an expense.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Trash2, Edit3, ArrowLeft } from 'lucide-react-native';
import { ExpenseForm } from '../../components/ExpenseForm';
import { useExpense, useUpdateExpense, useDeleteExpense, CreateExpenseData } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { colors, typography, spacing } from '../../theme';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const { data: expense, isLoading: expenseLoading } = useExpense(id);
  const { data: categories = [] } = useCategories();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const handleUpdate = async (data: CreateExpenseData) => {
    if (!id) return;
    
    try {
      await updateExpense.mutateAsync({ id, ...data });
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update expense'
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense.mutateAsync(id);
              router.back();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete expense'
              );
            }
          },
        },
      ]
    );
  };

  if (expenseLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.default} />
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Expense not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Expense</Text>
        </View>
        <ExpenseForm
          key={expense.id}
          initialData={{
            amount: expense.amount,
            merchant: expense.merchant,
            description: expense.description,
            category_id: expense.category_id,
            expense_date: expense.expense_date,
            receipt_url: expense.receipt_url,
            line_items:
              expense.expense_line_items?.map((li) => ({
                name: li.name,
                amount: li.amount,
                category_id: li.category_id,
              })) ?? [],
          }}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={updateExpense.isPending}
          submitLabel="Save Changes"
          enableReceiptScan={false}
          currency={expense.currency}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Expense Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setIsEditing(true)} style={styles.headerButton}>
            <Edit3 size={20} color={colors.text.primary} />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.headerButton}>
            <Trash2 size={20} color={colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <Text style={styles.detailValue}>
              {expense.merchant || 'Unknown'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryBadge}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: expense.categories?.color || colors.text.muted },
                ]}
              />
              <Text style={styles.detailValue}>
                {expense.categories?.name || 'Uncategorized'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(expense.expense_date)}
            </Text>
          </View>

          {expense.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{expense.description}</Text>
            </View>
          )}

          {expense.receipt_url && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receipt</Text>
              <Pressable
                onPress={() => Linking.openURL(expense.receipt_url || '')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Open</Text>
              </Pressable>
            </View>
          )}
        </View>

        {expense.expense_line_items && expense.expense_line_items.length > 0 ? (
          <View style={styles.linesCard}>
            <Text style={styles.linesTitle}>Receipt breakdown</Text>
            {[...expense.expense_line_items]
              .sort((a, b) => a.position - b.position)
              .map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineRowMain}>
                    <Text style={styles.lineName} numberOfLines={2}>
                      {line.name}
                    </Text>
                    <Text style={styles.lineAmount}>
                      {formatCurrency(line.amount, expense.currency)}
                    </Text>
                  </View>
                  <Text style={styles.lineCategory}>
                    {line.categories?.name ?? expense.categories?.name ?? 'Uncategorized'}
                  </Text>
                </View>
              ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  backButton: {
    backgroundColor: colors.accent.default,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.xs,
  },
  title: {
    flex: 1,
    ...typography.heading2,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  linkButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    ...typography.caption,
    color: colors.accent.default,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  linesCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linesTitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  lineRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  lineName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  lineAmount: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  lineCategory: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
});
