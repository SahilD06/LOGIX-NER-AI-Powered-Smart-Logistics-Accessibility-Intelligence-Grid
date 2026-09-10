import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { RAINFALL_BOXPLOT, BoxplotStats } from '../../services/analyticsData';
import { CloudRain, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react-native';

export const RainfallBoxplotChart: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedGroup, setSelectedGroup] = useState<'noLandslide' | 'landslide'>('landslide');

  const maxVal = 350;
  const chartHeight = 260;

  const getYPos = (val: number) => {
    return chartHeight - (val / maxVal) * (chartHeight - 40) - 20;
  };

  const currentStats = RAINFALL_BOXPLOT[selectedGroup];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Rainfall Distribution Comparison
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Precipitation (mm) Boxplot & Empirical Dispersion: Stable (0) vs. Landslide (1)
          </Text>
        </View>

        {/* Group Selector Toggle */}
        <View style={[styles.tabToggle, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              selectedGroup === 'noLandslide' && { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setSelectedGroup('noLandslide')}
          >
            <View style={[styles.colorDot, { backgroundColor: RAINFALL_BOXPLOT.noLandslide.color }]} />
            <Text
              style={[
                styles.tabBtnText,
                { color: selectedGroup === 'noLandslide' ? colors.textPrimary : colors.textMuted },
              ]}
            >
              Stable (0)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              selectedGroup === 'landslide' && { backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setSelectedGroup('landslide')}
          >
            <View style={[styles.colorDot, { backgroundColor: RAINFALL_BOXPLOT.landslide.color }]} />
            <Text
              style={[
                styles.tabBtnText,
                { color: selectedGroup === 'landslide' ? colors.textPrimary : colors.textMuted },
              ]}
            >
              Landslide (1)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chart Graphic */}
      <View style={styles.chartBody}>
        {/* Y-Axis scale */}
        <View style={[styles.yAxisScale, { height: chartHeight }]}>
          {[350, 300, 250, 200, 150, 100, 50, 0].map((tick) => (
            <View key={`tick-${tick}`} style={[styles.yTickWrapper, { top: getYPos(tick) - 7 }]}>
              <Text style={[styles.yTickText, { color: colors.textMuted }]}>{tick}</Text>
              <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
            </View>
          ))}
          <Text style={[styles.yAxisLabel, { color: colors.textMuted }]}>Rainfall mm</Text>
        </View>

        {/* Dual Boxplot Columns */}
        <View style={[styles.plotArea, { height: chartHeight }]}>
          {/* Critical Threshold Dotted Line (150mm) */}
          <View style={[styles.thresholdLine, { top: getYPos(150), borderColor: '#f39c12' }]}>
            <View style={styles.thresholdBadge}>
              <Text style={styles.thresholdBadgeText}>150mm Critical Threshold</Text>
            </View>
          </View>

          {/* Group 0: No Landslide */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedGroup('noLandslide')}
            style={[
              styles.boxColumn,
              selectedGroup === 'noLandslide' && styles.activeColumn,
            ]}
          >
            <BoxplotColumn
              stats={RAINFALL_BOXPLOT.noLandslide}
              chartHeight={chartHeight}
              getYPos={getYPos}
              isSelected={selectedGroup === 'noLandslide'}
              accentColor="#4db6ac"
            />
            <Text style={[styles.xAxisColLabel, { color: colors.textPrimary }]}>0 (No Slide)</Text>
          </TouchableOpacity>

          {/* Group 1: Landslide */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedGroup('landslide')}
            style={[
              styles.boxColumn,
              selectedGroup === 'landslide' && styles.activeColumn,
            ]}
          >
            <BoxplotColumn
              stats={RAINFALL_BOXPLOT.landslide}
              chartHeight={chartHeight}
              getYPos={getYPos}
              isSelected={selectedGroup === 'landslide'}
              accentColor="#e53935"
            />
            <Text style={[styles.xAxisColLabel, { color: colors.danger }]}>1 (Landslide)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary KPI Cards */}
      <View style={[styles.statCardsRow, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
        <View style={styles.statCard}>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Median Rainfall</Text>
          <Text style={[styles.statCardValue, { color: currentStats.color }]}>
            {currentStats.median.toFixed(1)} mm
          </Text>
          <Text style={[styles.statCardSub, { color: colors.textSecondary }]}>
            {selectedGroup === 'landslide' ? '+182.5% higher than baseline' : 'Normal rainfall baseline'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>IQR (Interquartile Range)</Text>
          <Text style={[styles.statCardValue, { color: colors.textPrimary }]}>
            {currentStats.q1} - {currentStats.q3} mm
          </Text>
          <Text style={[styles.statCardSub, { color: colors.textSecondary }]}>
            Middle 50% distribution
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Outlier Upper Range</Text>
          <Text style={[styles.statCardValue, { color: colors.steelBlue }]}>
            {currentStats.outlierMax} mm
          </Text>
          <Text style={[styles.statCardSub, { color: colors.textSecondary }]}>
            Peak torrential monsoon event
          </Text>
        </View>
      </View>
    </View>
  );
};

interface BoxplotColumnProps {
  stats: BoxplotStats;
  chartHeight: number;
  getYPos: (val: number) => number;
  isSelected: boolean;
  accentColor: string;
}

const BoxplotColumn: React.FC<BoxplotColumnProps> = ({ stats, chartHeight, getYPos, isSelected, accentColor }) => {
  const topWhiskerY = getYPos(stats.max);
  const bottomWhiskerY = getYPos(stats.min);
  const q3Y = getYPos(stats.q3);
  const q1Y = getYPos(stats.q1);
  const medianY = getYPos(stats.median);

  const boxHeight = Math.max(q1Y - q3Y, 4);

  return (
    <View style={styles.columnGraphicContainer}>
      {/* Whiskers Vertical Line */}
      <View
        style={[
          styles.whiskerLine,
          {
            top: topWhiskerY,
            height: bottomWhiskerY - topWhiskerY,
            backgroundColor: '#888',
          },
        ]}
      />

      {/* Top Cap */}
      <View style={[styles.whiskerCap, { top: topWhiskerY, backgroundColor: '#555' }]} />

      {/* Bottom Cap */}
      <View style={[styles.whiskerCap, { top: bottomWhiskerY, backgroundColor: '#555' }]} />

      {/* The IQR Box */}
      <View
        style={[
          styles.iqrBox,
          {
            top: q3Y,
            height: boxHeight,
            backgroundColor: isSelected ? 'rgba(180, 180, 180, 0.45)' : 'rgba(180, 180, 180, 0.25)',
            borderColor: '#666',
          },
        ]}
      >
        {/* Median Line */}
        <View
          style={[
            styles.medianLine,
            {
              top: medianY - q3Y,
              backgroundColor: '#444',
            },
          ]}
        />
      </View>

      {/* Empirical Jitter Points Line */}
      <View style={styles.jitterLineWrapper}>
        {stats.jitterPoints.map((val, idx) => {
          const y = getYPos(val);
          const jitterX = (Math.sin(idx * 7) * 3); // subtle jitter
          return (
            <View
              key={`dot-${idx}`}
              style={[
                styles.jitterDot,
                {
                  top: y - 3,
                  left: 20 + jitterX,
                  backgroundColor: accentColor,
                  borderColor: isSelected ? '#fff' : 'transparent',
                },
              ]}
            />
          );
        })}
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
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
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
  tabToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  yAxisScale: {
    width: 44,
    position: 'relative',
  },
  yTickWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yTickText: {
    fontSize: 10,
    fontWeight: '700',
    width: 26,
    textAlign: 'right',
  },
  gridLine: {
    flex: 1,
    height: 1,
    marginLeft: 6,
    opacity: 0.5,
  },
  yAxisLabel: {
    position: 'absolute',
    left: -20,
    top: 100,
    fontSize: 9,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  plotArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(150, 150, 150, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  thresholdLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    zIndex: 2,
  },
  thresholdBadge: {
    position: 'absolute',
    right: 8,
    top: -10,
    backgroundColor: 'rgba(243, 156, 18, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thresholdBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d68910',
  },
  boxColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  activeColumn: {
    backgroundColor: 'rgba(100, 150, 200, 0.05)',
    borderRadius: 8,
  },
  columnGraphicContainer: {
    width: 80,
    height: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  whiskerLine: {
    width: 2,
    position: 'absolute',
    left: 39,
  },
  whiskerCap: {
    width: 32,
    height: 2,
    position: 'absolute',
    left: 24,
  },
  iqrBox: {
    width: 72,
    position: 'absolute',
    left: 4,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  medianLine: {
    height: 2.5,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  jitterLineWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  jitterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    borderWidth: 0.5,
    opacity: 0.85,
  },
  xAxisColLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  statCardsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 140,
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statCardSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
