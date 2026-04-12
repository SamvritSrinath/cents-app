/**
 * @module SpendingTrendChart
 * @owner Dashboard
 * @updates 2024-12-31 - Initial implementation
 *
 * Line chart showing monthly spending trend.
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CurveType, LineChart } from 'react-native-gifted-charts';
import { MonthlySpending } from '../../hooks/useDashboard';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing as spacingTokens } from '../../theme';
import { AppColors } from '../../theme/colors';
import { formatCurrency } from '../../lib/utils';

interface SpendingTrendChartProps {
  data: MonthlySpending[];
  height?: number;
  currency?: string;
}

const INITIAL_SPACING = 16;
const END_SPACING = 16;

export function SpendingTrendChart({
  data,
  height = 220,
  currency = 'USD',
}: SpendingTrendChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [chartWidth, setChartWidth] = useState(0);

  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        value: item.amount,
        label: item.label,
      })),
    [data]
  );

  const pointSpacing = useMemo(() => {
    const n = chartData.length;
    const w = chartWidth > 0 ? chartWidth : 280;
    if (n <= 1) return 0;
    return Math.max(8, (w - INITIAL_SPACING - END_SPACING) / (n - 1));
  }, [chartData.length, chartWidth]);

  const maxValue = Math.max(...(data || []).map((d) => d.amount), 100);

  const pointerConfig = useMemo(
    () => ({
      pointerStripColor: colors.accent.default,
      pointerStripWidth: 1.5,
      pointerColor: colors.accent.default,
      radius: 5,
      pointerLabelWidth: 128,
      pointerLabelHeight: 48,
      autoAdjustPointerLabelPosition: true,
      pointerLabelComponent: (
        items: unknown,
        _secondaryItems: unknown,
        pointerIndex: number
      ) => {
        const list = Array.isArray(items) ? items : [];
        const first = list[0] as { value?: number } | undefined;
        const raw = first?.value;
        const value =
          typeof raw === 'number' && !Number.isNaN(raw) ? raw : 0;
        const monthLabel =
          pointerIndex >= 0 && pointerIndex < chartData.length
            ? chartData[pointerIndex]?.label ?? ''
            : '';
        return (
          <View
            style={[
              styles.tooltipContainer,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            {monthLabel ? (
              <Text style={[styles.tooltipMonth, { color: colors.text.muted }]}>
                {monthLabel}
              </Text>
            ) : null}
            <Text style={[styles.tooltipText, { color: colors.text.primary }]}>
              {formatCurrency(value, currency)}
            </Text>
          </View>
        );
      },
    }),
    [chartData, colors, currency, styles]
  );

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spending data yet</Text>
      </View>
    );
  }

  const width = chartWidth > 0 ? chartWidth : 280;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = Math.floor(e.nativeEvent.layout.width);
        if (w > 0 && w !== chartWidth) {
          setChartWidth(w);
        }
      }}
    >
      <LineChart
        data={chartData}
        height={height}
        width={width}
        color={colors.accent.default}
        thickness={3}
        dataPointsColor={colors.accent.default}
        dataPointsRadius={4}
        areaChart
        curved
        curveType={CurveType.QUADRATIC}
        curvature={0.2}
        startFillColor={colors.accent.default}
        endFillColor="transparent"
        startOpacity={0.28}
        endOpacity={0.02}
        mostNegativeValue={0}
        onlyPositive
        rulesType="dashed"
        rulesColor={colors.border}
        dashWidth={4}
        dashGap={6}
        noOfSections={4}
        hideYAxisText
        yAxisColor="transparent"
        xAxisColor={colors.border}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisLabelTextStyle={styles.axisLabel}
        initialSpacing={INITIAL_SPACING}
        endSpacing={END_SPACING}
        spacing={pointSpacing}
        maxValue={maxValue * 1.15}
        disableScroll
        nestedScrollEnabled
        labelsExtraHeight={28}
        xAxisLabelsHeight={24}
        overflowBottom={8}
        pointerConfig={pointerConfig}
      />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingTop: spacingTokens.sm,
      paddingBottom: spacingTokens.md,
      width: '100%',
    },
    emptyContainer: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body,
      color: colors.text.muted,
    },
    axisLabel: {
      ...typography.caption,
      color: colors.text.muted,
      width: '100%',
    },
    tooltipContainer: {
      paddingHorizontal: spacingTokens.sm,
      paddingVertical: spacingTokens.xs,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tooltipMonth: {
      ...typography.caption,
      fontSize: 11,
      marginBottom: 2,
    },
    tooltipText: {
      ...typography.caption,
      fontWeight: '700',
    },
  });
}
