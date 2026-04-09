/**
 * Receipt capture via system camera / photo library, then PaddleOCR API (same contract as expensely web).
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Check, RotateCcw, X } from 'lucide-react-native';

import { ParsedReceipt } from '../types/database';
import {
  prepareReceiptImageForOcr,
  scanReceiptFromUri,
} from '../lib/receiptOcr';
import { colors, typography, spacing } from '../theme';

export interface ReceiptScannerProps {
  onScan: (data: ParsedReceipt) => void;
  onClose?: () => void;
}

type ScanStatus = 'idle' | 'loading' | 'success' | 'error';

export function ReceiptScanner({ onScan, onClose }: ReceiptScannerProps) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedReceipt | null>(null);

  const runOcrOnUri = useCallback(async (uri: string) => {
    setPreviewUri(uri);
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const prepared = await prepareReceiptImageForOcr(uri);
      const parsed = await scanReceiptFromUri(prepared);
      setResult(parsed);
      setStatus('success');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to process receipt';
      setError(message);
      setStatus('error');
    }
  }, []);

  const pickWithCamera = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to scan a receipt.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (picked.canceled || !picked.assets[0]?.uri) return;
    await runOcrOnUri(picked.assets[0].uri);
  }, [runOcrOnUri]);

  const pickFromLibrary = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to choose a receipt.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (picked.canceled || !picked.assets[0]?.uri) return;
    await runOcrOnUri(picked.assets[0].uri);
  }, [runOcrOnUri]);

  const handleConfirm = useCallback(() => {
    if (result) {
      onScan(result);
      onClose?.();
    }
  }, [result, onScan, onClose]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setPreviewUri(null);
    setResult(null);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Scan receipt</Text>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
            <X size={22} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>

      {status === 'idle' && (
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={pickFromLibrary}
            accessibilityRole="button"
            accessibilityLabel="Choose receipt from library"
          >
            <ImageIcon size={22} color={colors.accent.default} />
            <Text style={styles.actionLabel}>Library</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={pickWithCamera}
            accessibilityRole="button"
            accessibilityLabel="Take receipt photo"
          >
            <Camera size={22} color={colors.accent.default} />
            <Text style={styles.actionLabel}>Camera</Text>
          </Pressable>
        </View>
      )}

      {status === 'loading' && (
        <View style={styles.centerBlock}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />
          ) : null}
          <ActivityIndicator size="large" color={colors.accent.default} style={styles.spinner} />
          <Text style={styles.muted}>Reading receipt…</Text>
        </View>
      )}

      {status === 'error' && error && (
        <View style={styles.centerBlock}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />
          ) : null}
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.secondaryBtn} onPress={handleReset}>
            <RotateCcw size={18} color={colors.text.primary} />
            <Text style={styles.secondaryBtnText}>Try again</Text>
          </Pressable>
        </View>
      )}

      {status === 'success' && result && (
        <View style={styles.centerBlock}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="contain" />
          ) : null}
          <View style={styles.summary}>
            {result.merchant ? (
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Merchant: </Text>
                {result.merchant}
              </Text>
            ) : null}
            {result.total != null ? (
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Total: </Text>
                {result.currency} {result.total.toFixed(2)}
              </Text>
            ) : null}
            {result.date ? (
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Date: </Text>
                {result.date}
              </Text>
            ) : null}
          </View>

          {result.items && result.items.length > 0 ? (
            <View style={styles.itemsBlock}>
              <Text style={styles.itemsHeading}>Line items ({result.items.length})</Text>
              <ScrollView
                style={styles.itemsScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
              >
                {result.items.map((item, idx) => (
                  <View key={`${idx}-${item.name}`} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name?.trim() || 'Item'}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {result.currency} {typeof item.price === 'number' ? item.price.toFixed(2) : '—'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.itemsHint}>
                After Apply, use Split by receipt line below the amount to assign each line to a
                category.
              </Text>
            </View>
          ) : result.total != null ? (
            <Text style={styles.itemsEmptyNote}>
              No line items were detected. After Apply, you can still split using the receipt total
              as one line, or edit the amount and categories on the form.
            </Text>
          ) : null}

          <View style={styles.successActions}>
            <Pressable style={styles.secondaryBtn} onPress={handleReset}>
              <Text style={styles.secondaryBtnText}>Scan again</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={handleConfirm}>
              <Check size={18} color={colors.background} />
              <Text style={styles.primaryBtnText}>Apply to form</Text>
            </Pressable>
          </View>
        </View>
      )}

      {status === 'idle' ? (
        <Text style={styles.hint}>Uses your OCR service (EXPO_PUBLIC_OCR_API_URL).</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  spinner: {
    marginVertical: spacing.sm,
  },
  muted: {
    ...typography.caption,
    color: colors.text.muted,
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    textAlign: 'center',
  },
  summary: {
    alignSelf: 'stretch',
    gap: spacing.xs,
  },
  summaryLine: {
    ...typography.body,
    color: colors.text.primary,
  },
  summaryKey: {
    color: colors.text.muted,
  },
  itemsBlock: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
    maxHeight: 200,
  },
  itemsHeading: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsScroll: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
  },
  itemPrice: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  itemsHint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  itemsEmptyNote: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  successActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accent.default,
  },
  primaryBtnText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
