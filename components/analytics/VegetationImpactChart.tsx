import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { VEGETATION_BINS, VegetationBin } from '../../services/analyticsData';
import { Trees, ShieldCheck, AlertCircle } from 'lucide-react-native';

export const VegetationImpactChart: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedBin, setSelectedBin] = useState<VegetationBin>(VEGETATION_BINS[9]); // default 90%

  const maxCount = 250;
  const chartHeight = 200;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Vegetation Impact
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Landslide Occurrence Frequency across Canopy Cover Tiers (0% - 90%)
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: 'rgba(70, 130, 180, 0.12)', borderColor: '#4682b4' }]}>
          <Trees size={13} color="#4682b4" />
          <Text style={[styles.badgeText, { color: '#4682b4' }]}>Root Biomass Buffer</Text>
        </View>
      </View>

      {/* Bar Chart Area */}
      <View style={styles.chartWrapper}>
        {/* Y-Axis scale */}
        <View style={[styles.yScale, { height: chartHeight }]}>
          {[240, 200, 160, 120, 80, 40, 0].map((tick) => {
            const topPos = chartHeight - (tick / maxCount) * chartHeight - 7;
            return (
              <View key={`y-tick-${tick}`} style={[styles.yTickItem, { top: topPos }]}>
                <Text style={[styles.yTickLabel, { color: colors.textMuted }]}>{tick}</Text>
                <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
              </View>
            );
          })}
          <Text style={[styles.yAxisTitle, { color: colors.textMuted }]}>Count of landslide_training.csv</Text>
        </View>

        {/* Bars Container */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsContainer}>
          {VEGETATION_BINS.map((item) => {
            const barHeight = (item.count / maxCount) * chartHeight;
            const isSelected = selectedBin.bin === item.bin;

            return (
              <TouchableOpacity
                key={`veg-bin-${item.bin}`}
                activeOpacity={0.8}
                onPress={() => setSelectedBin(item)}
                style={styles.barColumn}
              >
                {/* Count tooltip on active */}
                <View style={[styles.countBadge, { opacity: isSelected ? 1 : 0 }]}>
                  <Text style={styles.countBadgeText}>{item.count}</Text>
                </View>

                {/* Bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color,
                      borderColor: isSelected ? colors.textPrimary : 'transparent',
                      borderWidth: isSelected ? 2 : 0,
                    },
                  ]}
                />

                {/* X-Axis Tick */}
                <Text
                  style={[
                    styles.xTickLabel,
                    {
                      color: isSelected ? colors.textPrimary : colors.textMuted,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {item.bin}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={[styles.xAxisTitle, { color: colors.textSecondary }]}>
        Vegetation Cover (bin) %
      </Text>

      {/* Interactive Detail Box */}
      <View style={[styles.detailBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
        <View style={styles.detailHeader}>
          <View style={[styles.colorSquare, { backgroundColor: selectedBin.color }]} />
          <Text style={[styles.detailBinTitle, { color: colors.textPrimary }]}>
            {selectedBin.bin}% - {selectedBin.bin + 9}% Canopy Density
          </Text>
          <View style={styles.detailCountPill}>
            <Text style={styles.detailCountText}>{selectedBin.count} Events</Text>
          </View>
        </View>

        <Text style={[styles.detailRating, { color: colors.textSecondary }]}>
          Ecological Classification: <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{selectedBin.retentionRating}</Text>
        </Text>

        <Text style={[styles.detailInsight, { color: colors.textMuted }]}>
          {selectedBin.bin >= 90
            ? '✅ Critical Anchoring Effect: Root tensile strength and subsurface moisture transpiration diminish slope slip risk by over 59.3% compared to fragmented canopy.'
            : selectedBin.bin <= 10
            ? '⚠️ High Erosion Hazard: Devoid of deep root webs, surface runoff rapidly erodes topsoil layers leading to rapid slope failure.'
            : 'Moderate Stability: Partial root network helps delay saturation, but sustained torrential monsoon rainfall overcomes shearing thresholds.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  yScale: {
    width: 44,
    position: 'relative',
  },
  yTickItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yTickLabel: {
    fontSize: 9,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
  gridLine: {
    flex: 1,
    height: 1,
    marginLeft: 6,
    opacity: 0.4,
  },
  yAxisTitle: {
    position: 'absolute',
    left: -48,
    top: 90,
    fontSize: 8,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
    width: 140,
    textAlign: 'center',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(150, 150, 150, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    height: 200,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 38,
    height: '100%',
  },
  countBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  xTickLabel: {
    fontSize: 10,
    marginTop: 6,
  },
  xAxisTitle: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  detailBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  detailBinTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  detailCountPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailRating: {
    fontSize: 11,
    marginBottom: 4,
  },
  detailInsight: {
    fontSize: 11,
    lineHeight: 16,
  },
});
