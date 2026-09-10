import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { SCATTER_BUBBLE_POINTS, ScatterPoint } from '../../services/analyticsData';
import { Activity, Droplet, AlertTriangle, Crosshair } from 'lucide-react-native';

export const SeismicWaterScatterChart: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint>(SCATTER_BUBBLE_POINTS[0]);
  const [filterClass, setFilterClass] = useState<'all' | 'landslide' | 'stable'>('all');

  const chartWidth = 600;
  const chartHeight = 280;
  const maxX = 10.5;
  const maxY = 10.0;

  const getXPos = (waterKm: number) => {
    return (waterKm / maxX) * (chartWidth - 50) + 10;
  };

  const getYPos = (quake: number) => {
    return chartHeight - (quake / maxY) * (chartHeight - 40) - 20;
  };

  const getBubbleRadius = (saturation: number) => {
    return 3 + (saturation / 100) * 8; // 3px to 11px
  };

  const filteredPoints = SCATTER_BUBBLE_POINTS.filter((p) => {
    if (filterClass === 'landslide') return p.landslide === 1;
    if (filterClass === 'stable') return p.landslide === 0;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Seismic Shock vs. Distance to Water
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Earthquake Tremor Magnitude vs. River Proximity • Bubble Size: Soil Saturation %
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={[styles.filterGroup, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.filterBtn, filterClass === 'all' && { backgroundColor: colors.cardBg }]}
            onPress={() => setFilterClass('all')}
          >
            <Text style={[styles.filterText, { color: colors.textPrimary }]}>All ({SCATTER_BUBBLE_POINTS.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterClass === 'landslide' && { backgroundColor: colors.dangerBg }]}
            onPress={() => setFilterClass('landslide')}
          >
            <Text style={[styles.filterText, { color: colors.danger }]}>Slide (1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterClass === 'stable' && { backgroundColor: colors.cardBg }]}
            onPress={() => setFilterClass('stable')}
          >
            <Text style={[styles.filterText, { color: '#00897b' }]}>Stable (0)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scatter Area */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.chartBody, { width: chartWidth + 50 }]}>
          {/* Y-Axis scale (0 to 10 Richter) */}
          <View style={[styles.yAxisScale, { height: chartHeight }]}>
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((tick) => (
              <View key={`quake-tick-${tick}`} style={[styles.yTickWrapper, { top: getYPos(tick) - 7 }]}>
                <Text style={[styles.yTickLabel, { color: colors.textMuted }]}>{tick}</Text>
                <View style={[styles.gridLine, { width: chartWidth - 10, backgroundColor: colors.border }]} />
              </View>
            ))}
            <Text style={[styles.yAxisTitle, { color: colors.textMuted }]}>Earthquake Activity (Richter)</Text>
          </View>

          {/* Plotting Canvas Area */}
          <View style={[styles.plotSurface, { width: chartWidth, height: chartHeight }]}>
            {/* Liquefaction Danger Zone Box (<3.0km & >4.0 Richter) */}
            <View
              style={[
                styles.dangerZoneBox,
                {
                  left: getXPos(0),
                  width: getXPos(3.5) - getXPos(0),
                  top: getYPos(10),
                  height: getYPos(3.5) - getYPos(10),
                },
              ]}
            >
              <Text style={styles.dangerZoneTag}>⚡ Critical Liquefaction Corridor</Text>
            </View>

            {/* Scatter Point Bubbles */}
            {filteredPoints.map((pt) => {
              const cx = getXPos(pt.proximityToWater);
              const cy = getYPos(pt.earthquakeActivity);
              const radius = getBubbleRadius(pt.soilSaturation);
              const isSelected = selectedPoint?.id === pt.id;
              const isLandslide = pt.landslide === 1;

              return (
                <TouchableOpacity
                  key={`point-${pt.id}`}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPoint(pt)}
                  style={[
                    styles.bubble,
                    {
                      left: cx - radius,
                      top: cy - radius,
                      width: radius * 2,
                      height: radius * 2,
                      borderRadius: radius,
                      borderColor: isLandslide ? '#d9534f' : '#4db6ac',
                      borderWidth: isLandslide ? 1.8 : 1.4,
                      backgroundColor: isLandslide
                        ? isSelected
                          ? 'rgba(217, 83, 79, 0.5)'
                          : 'rgba(217, 83, 79, 0.08)'
                        : isSelected
                        ? 'rgba(77, 182, 172, 0.5)'
                        : 'rgba(77, 182, 172, 0.08)',
                    },
                    isSelected && {
                      shadowColor: isLandslide ? '#d9534f' : '#4db6ac',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.9,
                      shadowRadius: 6,
                      transform: [{ scale: 1.3 }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* X-Axis Ticks: Proximity to Water (0 to 10.5 km) */}
          <View style={[styles.xAxisTicks, { width: chartWidth, left: 40 }]}>
            {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5].map(
              (tick) => (
                <View key={`x-tick-${tick}`} style={[styles.xTickItem, { left: getXPos(tick) - 10 }]}>
                  <Text style={[styles.xTickText, { color: colors.textMuted }]}>{tick}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      <Text style={[styles.xAxisLabel, { color: colors.textSecondary }]}>
        Proximity to Water (km)
      </Text>

      {/* Floating Tooltip Detail Card (replicating the Tableau hover box) */}
      {selectedPoint && (
        <View style={[styles.tooltipBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipBadge}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: selectedPoint.landslide === 1 ? colors.danger : '#00897b' },
                ]}
              />
              <Text style={[styles.tooltipTitle, { color: colors.textPrimary }]}>
                Sample Event #{selectedPoint.id}
              </Text>
            </View>
            <Text
              style={[
                styles.landslideStatusText,
                { color: selectedPoint.landslide === 1 ? colors.danger : colors.success },
              ]}
            >
              {selectedPoint.landslide === 1 ? 'LANDSLIDE: 1' : 'NO SLIDE: 0'}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Earthquake Activity:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {selectedPoint.earthquakeActivity.toFixed(3)} Richter
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Proximity to Water:</Text>
              <Text style={[styles.metricVal, { color: colors.steelBlue }]}>
                {selectedPoint.proximityToWater.toFixed(3)} km
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Soil Saturation:</Text>
              <Text style={[styles.metricVal, { color: colors.warning }]}>
                {selectedPoint.soilSaturation.toFixed(2)} %
              </Text>
            </View>
          </View>
        </View>
      )}
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
    gap: 10,
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
  filterGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 4,
  },
  filterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 4,
  },
  chartBody: {
    flexDirection: 'column',
    position: 'relative',
    marginTop: 6,
  },
  yAxisScale: {
    width: 36,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  yTickWrapper: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yTickLabel: {
    fontSize: 9,
    fontWeight: '700',
    width: 18,
    textAlign: 'right',
  },
  gridLine: {
    height: 1,
    marginLeft: 6,
    opacity: 0.35,
  },
  yAxisTitle: {
    position: 'absolute',
    left: -50,
    top: 130,
    fontSize: 8,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
    width: 150,
    textAlign: 'center',
  },
  plotSurface: {
    position: 'relative',
    marginLeft: 36,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(150, 150, 150, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.25)',
  },
  dangerZoneBox: {
    position: 'absolute',
    backgroundColor: 'rgba(217, 83, 79, 0.06)',
    borderColor: 'rgba(217, 83, 79, 0.3)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 4,
    zIndex: 0,
  },
  dangerZoneTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#d9534f',
  },
  bubble: {
    position: 'absolute',
    zIndex: 2,
  },
  xAxisTicks: {
    height: 20,
    position: 'relative',
    marginTop: 6,
  },
  xTickItem: {
    position: 'absolute',
    alignItems: 'center',
    width: 24,
  },
  xTickText: {
    fontSize: 8,
    fontWeight: '700',
  },
  xAxisLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  tooltipBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  landslideStatusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
  },
});
