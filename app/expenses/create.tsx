/**
 * @module CreateExpenseScreen
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * Screen for creating a new expense.
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ExpenseForm } from '../../components/ExpenseForm';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { typography, spacing } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreateExpenseScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const createExpense = useCreateExpense();

  const handleSubmit = async (
    data: Parameters<typeof createExpense.mutate>[0]
  ) => {
    try {
      await createExpense.mutateAsync(data);
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create expense'
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Expense</Text>
      </View>

      <ExpenseForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createExpense.isPending || categoriesLoading}
        submitLabel="Add Expense"
        enableReceiptScan
      />
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
      ...typography.heading2,
      color: colors.text.primary,
    },
  });
}
