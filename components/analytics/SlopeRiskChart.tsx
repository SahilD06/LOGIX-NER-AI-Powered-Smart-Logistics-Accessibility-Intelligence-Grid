import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { SLOPE_RISK_DATA, SlopeRiskData } from '../../services/analyticsData';
import { Mountain, AlertTriangle, ChevronRight } from 'lucide-react-native';

export const SlopeRiskChart: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedClass, setSelectedClass] = useState<SlopeRiskData>(SLOPE_RISK_DATA[1]); // Landslide by default

  const maxVal = 60000;
  const chartHeight = 240;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Slope Angle vs. Landslide Risk
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Cumulative Terrain Inclination Gradient (Degrees Sum)
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <Mountain size={13} color={colors.danger} />
          <Text style={[styles.badgeText, { color: colors.danger }]}>Critical Gravity Force</Text>
        </View>
      </View>

      {/* Main Chart Graphic */}
      <View style={styles.chartWrapper}>
        {/* Y-Axis Scale (0K to 50K+) */}
        <View style={[styles.yAxisScale, { height: chartHeight }]}>
          {[50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0].map((k) => {
            const topPos = chartHeight - ((k * 1000) / maxVal) * chartHeight - 7;
            return (
              <View key={`slope-y-${k}`} style={[styles.yTickItem, { top: topPos }]}>
                <Text style={[styles.yTickText, { color: colors.textMuted }]}>{k}K</Text>
                <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
              </View>
            );
          })}
          <Text style={[styles.yAxisTitle, { color: colors.textMuted }]}>Slope Angle</Text>
        </View>

        {/* Dual Bars */}
        <View style={[styles.barsArea, { height: chartHeight }]}>
          {SLOPE_RISK_DATA.map((item) => {
            const barHeight = (item.totalUnits / maxVal) * chartHeight;
            const isSelected = selectedClass.landslide === item.landslide;

            return (
              <TouchableOpacity
                key={`slope-bar-${item.landslide}`}
                activeOpacity={0.8}
                onPress={() => setSelectedClass(item)}
                style={styles.barColumn}
              >
                {/* Floating Metric on Top */}
                <View style={[styles.metricFloat, { backgroundColor: item.color }]}>
                  <Text style={styles.metricFloatText}>{(item.totalUnits / 1000).toFixed(1)}k</Text>
                </View>

                {/* The Bar */}
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
                    styles.xAxisTick,
                    {
                      color: item.landslide === 1 ? colors.danger : colors.textPrimary,
                      fontWeight: '800',
                    },
                  ]}
                >
                  {item.landslide}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={[styles.xAxisTitle, { color: colors.textSecondary }]}>
        Landslide State (0 = No Slide, 1 = Triggered)
      </Text>

      {/* Geotechnical Breakdown Card */}
      <View style={[styles.detailCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
        <View style={styles.detailHeader}>
          <Text style={[styles.detailClassTitle, { color: selectedClass.color }]}>
            Class {selectedClass.classLabel}
          </Text>
          <Text style={[styles.detailAvg, { color: colors.textPrimary }]}>
            Average Slope: <Text style={{ fontWeight: '900' }}>{selectedClass.avgSlope}°</Text>
          </Text>
        </View>

        <View style={styles.slopeBreakdownGrid}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Gentle (&lt;20°)</Text>
            <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{selectedClass.breakdown.gentle}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Moderate (20-35°)</Text>
            <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>{selectedClass.breakdown.moderate}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Steep (35-50°)</Text>
            <Text style={[styles.breakdownVal, { color: colors.warning }]}>{selectedClass.breakdown.steep}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Extreme (&gt;50°)</Text>
            <Text style={[styles.breakdownVal, { color: colors.danger }]}>{selectedClass.breakdown.extreme}%</Text>
          </View>
        </View>

        <Text style={[styles.mechanicsText, { color: colors.textSecondary }]}>
          {selectedClass.landslide === 1
            ? '⚡ Shearing Force Domination: 75% of landslide triggers occur on slopes ≥35°, where gravitational shear stress overwhelms internal soil friction.'
            : '🛡️ Natural Equilibrium: Lower slope profiles (&lt;25°) maintain stable safety factors even during sustained precipitation.'}
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
    marginTop: 6,
  },
  yAxisScale: {
    width: 36,
    position: 'relative',
  },
  yTickItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yTickText: {
    fontSize: 9,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
  gridLine: {
    flex: 1,
    height: 1,
    marginLeft: 6,
    opacity: 0.35,
  },
  yAxisTitle: {
    position: 'absolute',
    left: -35,
    top: 100,
    fontSize: 9,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingRight: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(150, 150, 150, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.25)',
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 70,
    height: '100%',
  },
  metricFloat: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  metricFloatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  bar: {
    width: 54,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xAxisTick: {
    fontSize: 13,
    marginTop: 6,
  },
  xAxisTitle: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  detailCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailClassTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailAvg: {
    fontSize: 12,
  },
  slopeBreakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.15)',
    paddingVertical: 8,
    marginBottom: 8,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  mechanicsText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
