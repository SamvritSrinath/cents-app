/**
 * @module CategoriesScreen
 * @owner Categories
 * @updates 2026-04-07 - Expanded into a real category management screen
 *
 * Category management surface with creation, deletion, and category spend summaries.
 */

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Tag,
  Trash2,
  Sparkles,
  Pencil,
  Wallet,
} from 'lucide-react-native';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import {
  useBudgetProgress,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '../../hooks/useBudgets';
import { useSpendingByCategory } from '../../hooks/useDashboard';
import type { BudgetProgressRow, Category } from '../../types/database';
import { typography, spacing } from '../../theme';
import { AppColors } from '../../theme/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { formatCurrency } from '../../lib/utils';

const COLOR_CHOICES = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
];

const EMOJI_CHOICES = [
  '🛒',
  '🍔',
  '☕',
  '🚗',
  '🏠',
  '💊',
  '🎬',
  '✈️',
  '📱',
  '👕',
  '🎁',
  '📚',
  '🏋️',
  '💇',
  '🐕',
  '👶',
  '💰',
  '📦',
  '🔧',
  '⚡',
  '💼',
  '🎵',
  '🎮',
  '🌐',
  '🏥',
  '🎓',
  '🛍️',
  '🍕',
  '🍺',
  '🧾',
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { data: categories = [], isLoading } = useCategories();
  const { data: spendingByCategory = [] } = useSpendingByCategory();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: budgetProgress = [], isLoading: budgetLoading } =
    useBudgetProgress();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const updateBudget = useUpdateBudget();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategoryId, setBudgetCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<
    'weekly' | 'monthly' | 'yearly'
  >('monthly');
  const [editBudgetRow, setEditBudgetRow] = useState<BudgetProgressRow | null>(
    null
  );
  const [editAmount, setEditAmount] = useState('');
  const [editPeriod, setEditPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_CHOICES[0]);
  const [selectedEmoji, setSelectedEmoji] = useState('📦');

  const defaultCategories = useMemo(
    () => categories.filter((category) => category.is_default),
    [categories]
  );
  const customCategories = useMemo(
    () => categories.filter((category) => !category.is_default),
    [categories]
  );

  const budgetedCategoryIds = useMemo(
    () => new Set(budgetProgress.map((b) => b.category_id)),
    [budgetProgress]
  );

  const categoriesAvailableForBudget = useMemo(
    () => categories.filter((c) => !budgetedCategoryIds.has(c.id)),
    [categories, budgetedCategoryIds]
  );

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }

    try {
      await createCategory.mutateAsync({
        name: categoryName.trim(),
        color: selectedColor,
        icon: selectedEmoji,
      });
      setCategoryName('');
      setSelectedColor(COLOR_CHOICES[0]);
      setSelectedEmoji('📦');
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert(
        'Could not create category',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleCreateBudget = async () => {
    const amount = Number.parseFloat(budgetAmount);
    if (!budgetCategoryId) {
      Alert.alert('Category', 'Pick a category for this budget.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Amount', 'Enter a positive budget amount.');
      return;
    }
    try {
      await createBudget.mutateAsync({
        category_id: budgetCategoryId,
        amount,
        period: budgetPeriod,
      });
      setShowBudgetModal(false);
      setBudgetCategoryId('');
      setBudgetAmount('');
      setBudgetPeriod('monthly');
    } catch (error) {
      Alert.alert(
        'Could not create budget',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const openEditBudget = (row: BudgetProgressRow) => {
    setEditBudgetRow(row);
    setEditAmount(String(row.budget_amount));
    const p = row.period.toLowerCase();
    setEditPeriod(
      p === 'weekly' || p === 'yearly' || p === 'monthly' ? p : 'monthly'
    );
  };

  const handleUpdateBudget = async () => {
    if (!editBudgetRow) return;
    const amount = Number.parseFloat(editAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Amount', 'Enter a positive budget amount.');
      return;
    }
    try {
      await updateBudget.mutateAsync({
        id: editBudgetRow.budget_id,
        amount,
        period: editPeriod,
      });
      setEditBudgetRow(null);
    } catch (error) {
      Alert.alert(
        'Could not update budget',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleDeleteBudgetRow = (row: BudgetProgressRow) => {
    Alert.alert(
      'Delete budget?',
      `Remove the budget for ${row.category_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget.mutateAsync(row.budget_id);
            } catch (error) {
              Alert.alert(
                'Could not delete budget',
                error instanceof Error ? error.message : 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Delete category?',
      `Remove ${name} from your custom categories?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory.mutateAsync(id);
            } catch (error) {
              Alert.alert(
                'Could not delete category',
                error instanceof Error ? error.message : 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Budgets & Categories</Text>
          <Text style={styles.subtitle}>
            Set spending limits per category and manage your category library.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerSecondaryButton}
            onPress={() => setShowBudgetModal(true)}
          >
            <Wallet size={18} color={colors.accent.default} />
            <Text style={styles.headerSecondaryButtonText}>Budget</Text>
          </Pressable>
          <Pressable
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color={colors.background} />
            <Text style={styles.createButtonText}>Category</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budgets</Text>
          </View>
          {budgetLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.accent.default} />
            </View>
          ) : budgetProgress.length === 0 ? (
            <View style={styles.summaryCard}>
              <Wallet size={24} color={colors.text.muted} />
              <Text style={styles.emptySummaryText}>
                No budgets yet. Tap Budget to add a limit for a category.
              </Text>
            </View>
          ) : (
            budgetProgress.map((row) => {
              const pct = Math.min(100, Math.max(0, row.percentage_used));
              const over = row.spent_amount > row.budget_amount;
              return (
                <View key={row.budget_id} style={styles.budgetCard}>
                  <View style={styles.budgetCardTop}>
                    <View style={styles.budgetCardTitleRow}>
                      <Text style={styles.budgetEmoji}>
                        {getCategoryIcon(row.category_name, row.category_icon)}
                      </Text>
                      <Text style={styles.budgetCategoryName} numberOfLines={1}>
                        {row.category_name}
                      </Text>
                    </View>
                    <View style={styles.budgetActions}>
                      <Pressable
                        onPress={() => openEditBudget(row)}
                        hitSlop={8}
                        accessibilityLabel="Edit budget"
                      >
                        <Pencil size={18} color={colors.text.secondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteBudgetRow(row)}
                        hitSlop={8}
                        accessibilityLabel="Delete budget"
                      >
                        <Trash2 size={18} color={colors.semantic.error} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.budgetAmounts}>
                    {formatCurrency(row.spent_amount)} of{' '}
                    {formatCurrency(row.budget_amount)} · {row.period}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: over
                            ? colors.semantic.error
                            : colors.accent.default,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.budgetRemaining}>
                    {row.remaining_amount >= 0
                      ? `${formatCurrency(row.remaining_amount)} left`
                      : `${formatCurrency(-row.remaining_amount)} over`}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Sparkles size={24} color={colors.accent.default} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Receipt categories stay user-confirmed
            </Text>
            <Text style={styles.heroText}>
              Auto-suggestions can help, but the category you pick is what gets
              saved.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{defaultCategories.length}</Text>
            <Text style={styles.statLabel}>Default</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{customCategories.length}</Text>
            <Text style={styles.statLabel}>Custom</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{spendingByCategory.length}</Text>
            <Text style={styles.statLabel}>Active this month</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Library</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.accent.default} />
            </View>
          ) : (
            <>
              <CategoryGroup
                colors={colors}
                styles={styles}
                title="Default Categories"
                subtitle="Built-in categories available to everyone."
                categories={defaultCategories}
                accent="default"
              />

              <View style={styles.sectionSpacer} />

              <CategoryGroup
                colors={colors}
                styles={styles}
                title="Custom Categories"
                subtitle="Personal categories you create for faster sorting."
                categories={customCategories}
                accent="custom"
                onDelete={handleDeleteCategory}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Month</Text>
          </View>

          <View style={styles.summaryCard}>
            {spendingByCategory.length === 0 ? (
              <Text style={styles.emptySummaryText}>
                Add expenses to see category-level spending here.
              </Text>
            ) : (
              spendingByCategory.map((item) => (
                <View
                  key={item.categoryId || item.categoryName}
                  style={styles.spendingRow}
                >
                  <View style={styles.spendingLabelRow}>
                    <View
                      style={[
                        styles.spendingDot,
                        {
                          backgroundColor:
                            item.categoryColor || colors.text.muted,
                        },
                      ]}
                    />
                    <Text style={styles.spendingLabel} numberOfLines={1}>
                      {item.categoryName}
                    </Text>
                  </View>
                  <Text style={styles.spendingValue}>
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create category</Text>
            <Text style={styles.modalSubtitle}>
              Give the category a name and color for the expense picker.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category name"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="words"
            />

            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {COLOR_CHOICES.map((color) => {
                const selected = color === selectedColor;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selected && styles.colorSwatchSelected,
                    ]}
                  />
                );
              })}
            </View>

            <Text style={styles.colorLabel}>Emoji</Text>
            <View style={styles.emojiRow}>
              <TextInput
                style={styles.emojiInput}
                value={selectedEmoji}
                onChangeText={(value) => {
                  if (!value) {
                    setSelectedEmoji('📦');
                    return;
                  }
                  setSelectedEmoji(value.slice(-2));
                }}
                maxLength={2}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.emojiChoices}>
                  {EMOJI_CHOICES.map((emoji) => {
                    const selected = selectedEmoji === emoji;
                    return (
                      <Pressable
                        key={emoji}
                        style={[
                          styles.emojiChoice,
                          selected && styles.emojiChoiceSelected,
                        ]}
                        onPress={() => setSelectedEmoji(emoji)}
                      >
                        <Text style={styles.emojiChoiceText}>{emoji}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateCategory}
                disabled={createCategory.isPending}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {createCategory.isPending ? 'Creating...' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBudgetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.budgetModalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New budget</Text>
              <Text style={styles.modalSubtitle}>
                Choose a category without a budget yet, set a limit, and pick
                how often it resets.
              </Text>

              {categoriesAvailableForBudget.length === 0 ? (
                <Text style={styles.modalHint}>
                  Every category already has a budget, or you have no categories
                  yet.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryPickScroll}
                >
                  {categoriesAvailableForBudget.map((c) => {
                    const selected = budgetCategoryId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setBudgetCategoryId(c.id)}
                        style={[
                          styles.categoryPickChip,
                          selected && styles.categoryPickChipSelected,
                        ]}
                      >
                        <Text style={styles.categoryPickChipText}>
                          {getCategoryIcon(c.name, c.icon)} {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={styles.colorLabel}>Amount</Text>
              <TextInput
                style={styles.modalInput}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                placeholder="e.g. 400"
                placeholderTextColor={colors.text.muted}
                keyboardType="decimal-pad"
              />

              <Text style={styles.colorLabel}>Period</Text>
              <View style={styles.periodRow}>
                {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setBudgetPeriod(p)}
                    style={[
                      styles.periodChip,
                      budgetPeriod === p && styles.periodChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        budgetPeriod === p && styles.periodChipTextSelected,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowBudgetModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => void handleCreateBudget()}
                  disabled={
                    createBudget.isPending ||
                    categoriesAvailableForBudget.length === 0
                  }
                >
                  <Text style={styles.modalButtonPrimaryText}>
                    {createBudget.isPending ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={editBudgetRow !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditBudgetRow(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit budget</Text>
            {editBudgetRow ? (
              <Text style={styles.modalSubtitle}>
                {editBudgetRow.category_name}
              </Text>
            ) : null}

            <Text style={styles.colorLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              value={editAmount}
              onChangeText={setEditAmount}
              placeholder="Amount"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
            />

            <Text style={styles.colorLabel}>Period</Text>
            <View style={styles.periodRow}>
              {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setEditPeriod(p)}
                  style={[
                    styles.periodChip,
                    editPeriod === p && styles.periodChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodChipText,
                      editPeriod === p && styles.periodChipTextSelected,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setEditBudgetRow(null)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => void handleUpdateBudget()}
                disabled={updateBudget.isPending}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {updateBudget.isPending ? 'Saving...' : 'Update'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CategoryGroup({
  colors,
  styles,
  title,
  subtitle,
  categories,
  accent,
  onDelete,
}: {
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
  categories: Category[];
  accent: 'default' | 'custom';
  onDelete?: (id: string, name: string) => void;
}) {
  return (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View>
          <Text style={styles.groupTitle}>{title}</Text>
          <Text style={styles.groupSubtitle}>{subtitle}</Text>
        </View>
        <Tag
          size={18}
          color={
            accent === 'default' ? colors.accent.default : colors.text.muted
          }
        />
      </View>

      {categories.length === 0 ? (
        <Text style={styles.emptyGroupText}>No categories here yet.</Text>
      ) : (
        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const categoryColor = category.color || colors.text.muted;
            return (
              <View key={category.id} style={styles.categoryPill}>
                <View
                  style={[
                    styles.categoryPillDot,
                    { backgroundColor: categoryColor },
                  ]}
                />
                <Text style={styles.categoryPillEmoji}>
                  {getCategoryIcon(category.name, category.icon)}
                </Text>
                <Text style={styles.categoryPillText} numberOfLines={1}>
                  {category.name}
                </Text>
                {onDelete && !category.is_default ? (
                  <Pressable
                    onPress={() => onDelete(category.id, category.name)}
                    hitSlop={8}
                  >
                    <Trash2 size={14} color={colors.semantic.error} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
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
      justifyContent: 'space-between',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    headerTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerSecondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    headerSecondaryButtonText: {
      ...typography.caption,
      color: colors.accent.default,
      fontWeight: '600',
    },
    budgetCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    budgetCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    budgetCardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
      minWidth: 0,
    },
    budgetEmoji: {
      fontSize: 20,
    },
    budgetCategoryName: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '600',
      flex: 1,
    },
    budgetActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    budgetAmounts: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    budgetRemaining: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
    budgetModalScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: spacing.xl,
    },
    categoryPickScroll: {
      marginBottom: spacing.md,
      maxHeight: 48,
    },
    categoryPickChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      backgroundColor: colors.background,
    },
    categoryPickChipSelected: {
      borderColor: colors.accent.default,
      backgroundColor: `${colors.accent.default}18`,
    },
    categoryPickChipText: {
      ...typography.caption,
      color: colors.text.primary,
    },
    periodRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    periodChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodChipSelected: {
      borderColor: colors.accent.default,
      backgroundColor: `${colors.accent.default}18`,
    },
    periodChipText: {
      ...typography.caption,
      color: colors.text.secondary,
      textTransform: 'capitalize',
    },
    periodChipTextSelected: {
      color: colors.accent.default,
      fontWeight: '600',
    },
    modalHint: {
      ...typography.caption,
      color: colors.text.muted,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.heading1,
      color: colors.text.primary,
    },
    subtitle: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
      maxWidth: 260,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      backgroundColor: colors.accent.default,
    },
    createButtonText: {
      ...typography.caption,
      color: colors.background,
      fontWeight: '700',
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      margin: spacing.md,
      padding: spacing.md,
      flexDirection: 'row',
      gap: spacing.md,
    },
    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#10b9811a',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      ...typography.heading3,
      color: colors.text.primary,
    },
    heroText: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      lineHeight: 18,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    statValue: {
      ...typography.heading2,
      color: colors.text.primary,
    },
    statLabel: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: 2,
    },
    section: {
      padding: spacing.md,
      paddingBottom: 0,
    },
    sectionHeader: {
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.heading3,
      color: colors.text.primary,
    },
    loadingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      alignItems: 'center',
    },
    groupCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    groupTitle: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '700',
    },
    groupSubtitle: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: 2,
      maxWidth: 260,
    },
    emptyGroupText: {
      ...typography.caption,
      color: colors.text.muted,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: '100%',
    },
    categoryPillDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    categoryPillText: {
      ...typography.caption,
      color: colors.text.primary,
      fontWeight: '600',
      maxWidth: 140,
    },
    categoryPillEmoji: {
      fontSize: 16,
    },
    sectionSpacer: {
      height: spacing.md,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
    },
    emptySummaryText: {
      ...typography.caption,
      color: colors.text.muted,
      lineHeight: 18,
    },
    spendingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    spendingLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
      paddingRight: spacing.md,
    },
    spendingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    spendingLabel: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    spendingValue: {
      ...typography.caption,
      color: colors.text.muted,
      fontWeight: '700',
    },
    bottomSpacer: {
      height: spacing.xxl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    modalCard: {
      backgroundColor: colors.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    modalTitle: {
      ...typography.heading2,
      color: colors.text.primary,
    },
    modalSubtitle: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
    modalInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text.primary,
    },
    colorLabel: {
      ...typography.caption,
      color: colors.text.muted,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    emojiRow: {
      gap: spacing.sm,
    },
    emojiInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      ...typography.body,
      color: colors.text.primary,
      width: 56,
      textAlign: 'center',
      fontSize: 22,
    },
    emojiChoices: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    emojiChoice: {
      width: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiChoiceSelected: {
      borderColor: colors.accent.default,
    },
    emojiChoiceText: {
      fontSize: 18,
    },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorSwatchSelected: {
      borderColor: colors.text.primary,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    modalButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    modalButtonSecondary: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonPrimary: {
      backgroundColor: colors.accent.default,
    },
    modalButtonSecondaryText: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '700',
    },
    modalButtonPrimaryText: {
      ...typography.body,
      color: colors.background,
      fontWeight: '700',
    },
  });
}
