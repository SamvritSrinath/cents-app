/**
 * @module ExpenseForm
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * Form component for creating and editing expenses.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  Animated,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Tag,
  Store,
  FileText,
  ScanLine,
  ListTree,
  ChevronRight,
} from 'lucide-react-native';
import { Category, ParsedReceipt } from '../types/database';
import { CreateExpenseData } from '../hooks/useExpenses';
import { CategoryPicker } from './CategoryPicker';
import { ReceiptScanner } from './ReceiptScanner';
import { suggestCategoryIdFromReceiptInput } from '../lib/receiptCategorization';
import { normalizeExpenseDateFromOcr } from '../lib/receiptOcr';
import { getCategoryIcon } from '../lib/categoryIcons';
import {
  formatCurrency,
  toLocalISODateString,
  formatUsShortDate,
  isValidIsoDateString,
  parseCalendarOrDateString,
} from '../lib/utils';
import { typography, spacing } from '../theme';
import { AppColors } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

const LINE_SUM_TOLERANCE = 0.02;

interface ReceiptLine {
  name: string;
  price: number;
}

interface ExpenseFormProps {
  initialData?: Partial<CreateExpenseData>;
  categories: Category[];
  onSubmit: (data: CreateExpenseData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  /** When true, show receipt OCR scanner (new expense flow). */
  enableReceiptScan?: boolean;
  /** ISO currency for formatting line totals (default USD). */
  currency?: string;
}

export function ExpenseForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
  enableReceiptScan = false,
  currency = 'USD',
}: ExpenseFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const panelW = Math.round(screenW * 0.88);
  const slideAnim = useRef(new Animated.Value(panelW)).current;

  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initialData?.category_id || null
  );
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || '');
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expense_date || toLocalISODateString(new Date())
  );
  const [showMainCategoryPicker, setShowMainCategoryPicker] = useState(false);
  const [pickingLineIndex, setPickingLineIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAutoCategorized, setHasAutoCategorized] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useColorScheme();

  const datePickerValue = useMemo(() => {
    if (isValidIsoDateString(expenseDate)) {
      return parseCalendarOrDateString(expenseDate);
    }
    return new Date();
  }, [expenseDate]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (date && !Number.isNaN(date.getTime())) {
      setExpenseDate(toLocalISODateString(date));
    }
  };

  const [receiptLines, setReceiptLines] = useState<ReceiptLine[]>(() =>
    (initialData?.line_items ?? []).map((li) => ({
      name: li.name,
      price: li.amount,
    }))
  );
  const [lineCategories, setLineCategories] = useState<(string | null)[]>(() =>
    (initialData?.line_items ?? []).map((li) => li.category_id)
  );
  const [splitByLine, setSplitByLine] = useState(
    () => (initialData?.line_items?.length ?? 0) > 0
  );
  const [showSplitPanel, setShowSplitPanel] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    slideAnim.setValue(panelW);
    if (showSplitPanel) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [showSplitPanel, panelW, slideAnim]);

  const handleReceiptScan = (data: ParsedReceipt) => {
    if (data.total != null) {
      setAmount(data.total.toString());
    }
    if (data.merchant) {
      setMerchant(data.merchant);
    }
    const normalizedDate = normalizeExpenseDateFromOcr(data.date);
    if (normalizedDate) {
      setExpenseDate(normalizedDate);
    }
    let lines: ReceiptLine[] = (data.items ?? [])
      .filter(
        (i) => i.name?.trim() || (typeof i.price === 'number' && i.price > 0)
      )
      .map((i) => ({
        name: (i.name || 'Item').trim() || 'Item',
        price:
          typeof i.price === 'number' && !Number.isNaN(i.price) ? i.price : 0,
      }));
    if (lines.length === 0 && data.total != null && data.total > 0) {
      lines = [{ name: 'Receipt total', price: data.total }];
    }
    setReceiptLines(lines);
    setSplitByLine(false);
    setLineCategories([]);
    setShowSplitPanel(false);
    setHasAutoCategorized(false);
    setShowReceiptScanner(false);
  };

  useEffect(() => {
    if (categoryId || hasAutoCategorized) return;

    const suggestedCategoryId = suggestCategoryIdFromReceiptInput(
      categories,
      merchant,
      description
    );

    if (suggestedCategoryId) {
      setCategoryId(suggestedCategoryId);
      setHasAutoCategorized(true);
    }
  }, [categories, merchant, description, categoryId, hasAutoCategorized]);

  const canSplit = receiptLines.length > 0;

  const lineSum = receiptLines.reduce((s, l) => s + l.price, 0);
  const parsedAmount = parseFloat(amount);
  const sumMismatch =
    splitByLine &&
    canSplit &&
    !Number.isNaN(parsedAmount) &&
    Math.abs(lineSum - parsedAmount) > LINE_SUM_TOLERANCE;

  const onToggleSplit = (value: boolean) => {
    setSplitByLine(value);
    setErrors((e) => {
      const { split: _, ...rest } = e;
      return rest;
    });
    if (value && canSplit) {
      setLineCategories(receiptLines.map(() => categoryId));
      setShowSplitPanel(true);
    } else {
      setShowSplitPanel(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!expenseDate || !isValidIsoDateString(expenseDate)) {
      newErrors.date = 'Please select a valid date';
    }

    if (splitByLine && canSplit) {
      if (sumMismatch) {
        newErrors.split = `Lines add up to ${formatCurrency(lineSum, currency)} but total is ${formatCurrency(amt, currency)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closePickers = () => {
    setShowMainCategoryPicker(false);
    setPickingLineIndex(null);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const base: CreateExpenseData = {
      amount: parseFloat(amount),
      merchant: merchant.trim() || null,
      description: description.trim() || null,
      category_id: categoryId,
      expense_date: expenseDate,
      receipt_url: receiptUrl.trim() || null,
    };

    if (splitByLine && canSplit) {
      onSubmit({
        ...base,
        line_items: receiptLines.map((l, i) => ({
          name: l.name,
          amount: l.price,
          category_id: lineCategories[i] ?? categoryId,
        })),
      });
    } else {
      onSubmit({
        ...base,
        line_items: [],
      });
    }
  };

  const categoryLabelAt = (id: string | null) => {
    if (!id) return 'Default category';
    return categories.find((c) => c.id === id)?.name ?? 'Category';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {enableReceiptScan ? (
          <View style={styles.scanSection}>
            <Pressable
              style={styles.scanToggle}
              onPress={() => setShowReceiptScanner((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showReceiptScanner }}
            >
              <ScanLine size={20} color={colors.accent.default} />
              <Text style={styles.scanToggleText}>
                {showReceiptScanner ? 'Hide receipt scan' : 'Scan receipt'}
              </Text>
            </Pressable>
            {showReceiptScanner ? (
              <ReceiptScanner
                onScan={handleReceiptScan}
                onClose={() => setShowReceiptScanner(false)}
              />
            ) : null}
          </View>
        ) : null}

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.amountInput, errors.amount && styles.inputError]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
              testID="amount-input"
            />
          </View>
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
          {canSplit ? (
            <Text style={styles.afterAmountHint}>
              Split by receipt line (next) assigns each line to a category for
              budgets.
            </Text>
          ) : null}
        </View>

        {canSplit ? (
          <View style={styles.inputGroup}>
            <View style={styles.splitRow}>
              <View style={styles.splitRowText}>
                <ListTree size={20} color={colors.accent.default} />
                <View style={styles.splitLabels}>
                  <Text style={styles.splitTitle}>Split by receipt line</Text>
                  <Text style={styles.splitSubtitle}>
                    Assign each line to a category (shown after Apply to form).
                  </Text>
                </View>
              </View>
              <Switch
                value={splitByLine}
                onValueChange={onToggleSplit}
                trackColor={{
                  false: colors.border,
                  true: `${colors.accent.default}80`,
                }}
                thumbColor={
                  splitByLine ? colors.accent.default : colors.text.muted
                }
                accessibilityLabel="Split expense by receipt line items"
              />
            </View>
            {splitByLine ? (
              <Pressable
                style={styles.openPanelButton}
                onPress={() => setShowSplitPanel(true)}
                accessibilityRole="button"
              >
                <Text style={styles.openPanelButtonText}>
                  {receiptLines.length} lines — assign categories
                </Text>
                <ChevronRight size={18} color={colors.accent.default} />
              </Pressable>
            ) : null}
            {errors.split ? (
              <Text style={styles.errorText}>{errors.split}</Text>
            ) : null}
            {splitByLine && sumMismatch ? (
              <Text style={styles.warningText}>
                Adjust amounts or lines so the itemized total matches the
                receipt total.
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Merchant Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Merchant</Text>
          <View style={styles.inputWithIcon}>
            <Store size={20} color={colors.text.muted} />
            <TextInput
              style={styles.textInput}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Where did you spend?"
              placeholderTextColor={colors.text.muted}
              testID="merchant-input"
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <Pressable
            style={styles.inputWithIcon}
            onPress={() => setShowMainCategoryPicker(true)}
            testID="category-selector"
          >
            {selectedCategory ? (
              <Text style={styles.categoryEmoji}>
                {getCategoryIcon(selectedCategory.name, selectedCategory.icon)}
              </Text>
            ) : (
              <Tag size={20} color={colors.text.muted} />
            )}
            <Text
              style={[
                styles.selectorText,
                !selectedCategory && styles.placeholderText,
              ]}
            >
              {selectedCategory?.name || 'Select category'}
            </Text>
          </Pressable>
          <Text style={styles.helperText}>
            Default category for this trip. Used for the whole receipt unless
            you split by line.
          </Text>
        </View>

        {/* Date — stored as YYYY-MM-DD; shown as MM/DD/YYYY */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <Pressable
            style={({ pressed }) => [
              styles.inputWithIcon,
              errors.date ? styles.inputError : null,
              pressed ? styles.datePressablePressed : null,
            ]}
            onPress={() => setShowDatePicker(true)}
            testID="date-input"
            accessibilityRole="button"
            accessibilityLabel="Expense date, opens calendar"
          >
            <Calendar size={20} color={colors.text.muted} />
            <Text style={styles.dateDisplayText}>
              {isValidIsoDateString(expenseDate)
                ? formatUsShortDate(expenseDate)
                : 'MM/DD/YYYY'}
            </Text>
          </Pressable>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <View style={[styles.inputWithIcon, styles.notesInput]}>
            <FileText
              size={20}
              color={colors.text.muted}
              style={styles.notesIcon}
            />
            <TextInput
              style={[styles.textInput, styles.notesTextInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>
        </View>

        {/* Receipt URL Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Receipt URL</Text>
          <View style={styles.inputWithIcon}>
            <FileText size={20} color={colors.text.muted} />
            <TextInput
              style={styles.textInput}
              value={receiptUrl}
              onChangeText={setReceiptUrl}
              placeholder="Paste receipt link (optional)"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              testID="receipt-input"
            />
          </View>
          {receiptUrl ? (
            <Text style={styles.helperText}>
              If this came from a scan, verify the category matches the receipt.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actions,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : submitLabel}
          </Text>
        </Pressable>
      </View>

      <CategoryPicker
        visible={showMainCategoryPicker || pickingLineIndex !== null}
        title={
          pickingLineIndex !== null ? 'Line item category' : 'Select Category'
        }
        categories={categories}
        selectedId={
          pickingLineIndex !== null
            ? (lineCategories[pickingLineIndex] ?? null)
            : categoryId
        }
        onSelect={(cat) => {
          const id = cat?.id ?? null;
          if (pickingLineIndex !== null) {
            const idx = pickingLineIndex;
            setLineCategories((prev) => {
              const next = [...prev];
              next[idx] = id;
              return next;
            });
          } else {
            setCategoryId(id);
          }
        }}
        onClose={closePickers}
      />

      <Modal
        visible={showSplitPanel}
        transparent
        animationType="none"
        onRequestClose={() => setShowSplitPanel(false)}
      >
        <View style={styles.splitOverlay}>
          <Pressable
            style={styles.splitBackdrop}
            onPress={() => setShowSplitPanel(false)}
          />
          <Animated.View
            style={[
              styles.splitPanel,
              {
                width: panelW,
                paddingTop: insets.top + spacing.md,
                paddingBottom: insets.bottom + spacing.md,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.splitPanelHeader}>
              <Text style={styles.splitPanelTitle}>Receipt lines</Text>
              <Pressable onPress={() => setShowSplitPanel(false)} hitSlop={12}>
                <Text style={styles.splitPanelDone}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.splitPanelMeta}>
              Total {formatCurrency(parsedAmount, currency)} · Lines{' '}
              {formatCurrency(lineSum, currency)}
            </Text>
            <ScrollView
              style={styles.splitPanelList}
              keyboardShouldPersistTaps="handled"
            >
              {receiptLines.map((line, index) => (
                <View key={`${line.name}-${index}`} style={styles.splitLineRow}>
                  <View style={styles.splitLineMain}>
                    <Text style={styles.splitLineName} numberOfLines={2}>
                      {line.name}
                    </Text>
                    <Text style={styles.splitLineAmount}>
                      {formatCurrency(line.price, currency)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.splitLineCategoryBtn}
                    onPress={() => setPickingLineIndex(index)}
                  >
                    <Text
                      style={styles.splitLineCategoryLabel}
                      numberOfLines={1}
                    >
                      {categoryLabelAt(lineCategories[index] ?? categoryId)}
                    </Text>
                    <ChevronRight size={16} color={colors.text.muted} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <Pressable
            style={styles.datePickerBackdrop}
            onPress={() => setShowDatePicker(false)}
            accessibilityLabel="Dismiss calendar"
          />
          <View
            style={[
              styles.datePickerSheet,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Expense date</Text>
              <Pressable onPress={() => setShowDatePicker(false)} hitSlop={12}>
                <Text style={styles.datePickerDone}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={datePickerValue}
              mode="date"
              display="inline"
              themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
              onChange={handleDateChange}
            />
          </View>
        </View>
      </Modal>

      {Platform.OS === 'android' && showDatePicker ? (
        <DateTimePicker
          value={datePickerValue}
          mode="date"
          display="default"
          themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
          onChange={handleDateChange}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  scanSection: {
    marginBottom: spacing.md,
  },
  scanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  scanToggleText: {
    ...typography.body,
    color: colors.accent.default,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    ...typography.heading1,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    ...typography.heading1,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  afterAmountHint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  datePressablePressed: {
    opacity: 0.85,
  },
  dateDisplayText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerSheet: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  datePickerDone: {
    ...typography.body,
    color: colors.accent.default,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  selectorText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.muted,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  notesInput: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesTextInput: {
    minHeight: 80,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  warningText: {
    ...typography.caption,
    color: colors.semantic.warning,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  splitRowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  splitLabels: {
    flex: 1,
  },
  splitTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  splitSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  openPanelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  openPanelButtonText: {
    ...typography.body,
    color: colors.accent.default,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.accent.default,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  splitOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  splitBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 0,
  },
  splitPanel: {
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    maxHeight: '100%',
    zIndex: 1,
    elevation: 8,
  },
  splitPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  splitPanelTitle: {
    ...typography.heading3,
    color: colors.text.primary,
  },
  splitPanelDone: {
    ...typography.body,
    color: colors.accent.default,
    fontWeight: '600',
  },
  splitPanelMeta: {
    ...typography.caption,
    color: colors.text.muted,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  splitPanelList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  splitLineRow: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  splitLineMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  splitLineName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  splitLineAmount: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  splitLineCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  splitLineCategoryLabel: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '600',
  },
});
}
