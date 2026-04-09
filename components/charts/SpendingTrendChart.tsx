/**
 * @module SpendingTrendChart
 * @owner Dashboard
 * @updates 2024-12-31 - Initial implementation
 *
 * Line chart showing monthly spending trend.
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MonthlySpending } from '../../hooks/useDashboard';
import { colors, typography, spacing } from '../../theme';
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
  height = 200,
  currency = 'USD',
}: SpendingTrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        value: item.amount,
        label: item.label,
      })),
    [data]
  );

  const spacing = useMemo(() => {
    const n = chartData.length;
    const w = chartWidth > 0 ? chartWidth : 280;
    if (n <= 1) return 0;
    return Math.max(8, (w - INITIAL_SPACING - END_SPACING) / (n - 1));
  }, [chartData.length, chartWidth]);

  const maxValue = Math.max(...(data || []).map((d) => d.amount), 100);

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
        curvature={0.35}
        startFillColor={colors.accent.default}
        endFillColor="transparent"
        startOpacity={0.2}
        endOpacity={0.01}
        rulesType="none"
        hideYAxisText
        yAxisColor="transparent"
        xAxisColor="transparent"
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={styles.axisLabel}
        initialSpacing={INITIAL_SPACING}
        endSpacing={END_SPACING}
        spacing={spacing}
        maxValue={maxValue * 1.2}
        pointerConfig={{
          pointerStripColor: colors.accent.default,
          pointerStripWidth: 1.5,
          pointerColor: colors.accent.default,
          radius: 5,
          pointerLabelWidth: 100,
          pointerLabelHeight: 35,
          pointerLabelComponent: (items: { value: number }[]) => {
            return (
              <View style={styles.tooltipContainer}>
                <Text style={styles.tooltipText}>
                  {formatCurrency(items[0].value, currency)}
                </Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
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
  },
  tooltipContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tooltipText: {
    ...typography.caption,
    color: colors.accent.default,
    fontWeight: '600',
  },
});
