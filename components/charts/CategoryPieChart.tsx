/**
 * @module CategoryPieChart
 * @owner Dashboard
 * @updates 2024-12-31 - Initial implementation
 *
 * Pie/Donut chart showing spending by category.
 */

import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategorySpending } from '../../hooks/useDashboard';
import { colors, typography, spacing } from '../../theme';
import { formatCurrency } from '../../lib/utils';

interface CategoryPieChartProps {
  data: CategorySpending[];
  size?: number;
  currency?: string;
}

export function CategoryPieChart({
  data,
  size: sizeProp,
  currency = 'USD',
}: CategoryPieChartProps) {
  const { width: winW } = useWindowDimensions();
  const defaultSize = Math.min(168, Math.max(132, Math.floor(winW * 0.36)));
  const size = sizeProp ?? defaultSize;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spending data</Text>
      </View>
    );
  }

  const totalSpending = data.reduce((sum, d) => sum + d.amount, 0);

  const pieData = data.map((item) => ({
    value: item.amount,
    color: item.categoryColor,
  }));

  const innerR = size / 3;
  const labelMaxW = innerR * 1.85;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          donut
          radius={size / 2}
          innerRadius={innerR}
          innerCircleColor={colors.background}
          centerLabelComponent={() => (
            <View style={[styles.centerLabel, { maxWidth: labelMaxW }]}>
              <Text
                style={styles.centerAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.45}
              >
                {formatCurrency(totalSpending, currency)}
              </Text>
              <Text style={styles.centerSubtext} numberOfLines={1}>
                This Month
              </Text>
            </View>
          )}
        />
      </View>

      <Text style={styles.totalCaption} numberOfLines={1}>
        Total {formatCurrency(totalSpending, currency)}
      </Text>

      {/* Legend */}
      <View style={styles.legend}>
        {data.slice(0, 5).map((item) => (
          <View key={item.categoryId || 'uncategorized'} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.categoryColor }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.categoryName}
            </Text>
            <Text style={styles.legendAmount} numberOfLines={1}>
              {formatCurrency(item.amount, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  centerAmount: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  totalCaption: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  legend: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  legendAmount: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
    maxWidth: '42%',
    textAlign: 'right',
  },
});
