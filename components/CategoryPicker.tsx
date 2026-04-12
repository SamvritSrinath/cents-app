/**
 * @module CategoryPicker
 * @owner Expenses
 * @updates 2024-12-31 - Initial implementation
 *
 * Bottom sheet component for selecting expense categories.
 */

import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { X, Check, Tag } from 'lucide-react-native';
import { Category } from '../types/database';
import { typography, spacing } from '../theme';
import { AppColors } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { getCategoryIcon } from '../lib/categoryIcons';

interface CategoryPickerProps {
  visible: boolean;
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category | null) => void;
  onClose: () => void;
  /** Overrides default "Select Category" header title */
  title?: string;
}

export function CategoryPicker({
  visible,
  categories,
  selectedId,
  onSelect,
  onClose,
  title = 'Select Category',
}: CategoryPickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Category List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {/* None option */}
            <Pressable
              style={[styles.item, !selectedId && styles.itemSelected]}
              onPress={() => {
                onSelect(null);
                onClose();
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${colors.text.muted}20` },
                ]}
              >
                <Tag size={18} color={colors.text.muted} />
              </View>
              <Text style={styles.itemText}>No Category</Text>
              {!selectedId && <Check size={20} color={colors.accent.default} />}
            </Pressable>

            {categories.map((category) => {
              const isSelected = category.id === selectedId;
              const categoryColor = category.color || colors.text.muted;

              return (
                <Pressable
                  key={category.id}
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => {
                    onSelect(category);
                    onClose();
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${categoryColor}20` },
                    ]}
                  >
                    <Text style={styles.emoji}>
                      {getCategoryIcon(category.name, category.icon)}
                    </Text>
                  </View>
                  <Text style={styles.itemText}>{category.name}</Text>
                  {isSelected && (
                    <Check size={20} color={colors.accent.default} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...typography.heading3,
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    list: {
      padding: spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.xs,
    },
    itemSelected: {
      backgroundColor: colors.card,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    itemText: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    emoji: {
      fontSize: 18,
    },
  });
}
