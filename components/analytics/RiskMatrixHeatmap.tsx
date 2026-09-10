import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { RAINFALL_BINS, SOIL_SATURATION_LEVELS, HEATMAP_DATA, HeatmapCell } from '../../services/analyticsData';
import { Info, Sparkles, Activity, AlertTriangle } from 'lucide-react-native';

interface RiskMatrixHeatmapProps {
  compact?: boolean;
  highlightCell?: { rainfall: number; soilSaturation: number };
  onCellSelect?: (cell: HeatmapCell) => void;
}

export const RiskMatrixHeatmap: React.FC<RiskMatrixHeatmapProps> = ({
  compact = false,
  highlightCell,
  onCellSelect,
}) => {
  const { colors, isDark } = useAppTheme();
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Map incident count (0 to 22) to color
  const getCellColor = (count: number) => {
    if (count >= 20) return '#b71c1c'; // Dark Crimson
    if (count >= 16) return '#d32f2f'; // Crimson Red
    if (count >= 12) return '#e57373'; // Light Coral Red
    if (count >= 9) return '#ff8a80';  // Soft Salmon
    if (count >= 6) return '#c8e6c9';  // Pale Sage Green
    if (count >= 3) return '#81c784';  // Medium Green
    return '#2e7d32'; // Deep Emerald Green
  };

  // Map seismic activity (0.76 to 39.25) to relative square size (in px)
  const getSquareSize = (seismic: number, baseCellSize: number) => {
    const minSize = baseCellSize * 0.32;
    const maxSize = baseCellSize * 0.88;
    const ratio = Math.min(Math.max((seismic - 0.76) / 38.5, 0), 1);
    return minSize + ratio * (maxSize - minSize);
  };

  const cellSize = compact ? 22 : 36;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Risk Matrix Heatmap
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Soil Saturation vs. Rainfall mm (bin) • Scaled by Seismic Shock
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendGroup}>
            <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Landslide Count</Text>
            <View style={styles.gradientBarRow}>
              <Text style={[styles.legendValue, { color: '#b71c1c' }]}>0</Text>
              <View style={styles.segmentedGradient}>
                <View style={{ flex: 1, backgroundColor: '#b71c1c' }} />
                <View style={{ flex: 1, backgroundColor: '#d32f2f' }} />
                <View style={{ flex: 1, backgroundColor: '#e57373' }} />
                <View style={{ flex: 1, backgroundColor: '#ff8a80' }} />
                <View style={{ flex: 1, backgroundColor: '#c8e6c9' }} />
                <View style={{ flex: 1, backgroundColor: '#81c784' }} />
                <View style={{ flex: 1, backgroundColor: '#2e7d32' }} />
              </View>
              <Text style={[styles.legendValue, { color: '#2e7d32' }]}>22</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Grid Container */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
        <View style={styles.matrixWrapper}>
          {/* Top X-Axis Header: Rainfall mm (bin) */}
          <View style={styles.xAxisHeaderRow}>
            <View style={[styles.yAxisLabelSpacer, { width: 50 }]} />
            <Text style={[styles.axisTitleText, { color: colors.textSecondary }]}>Rainfall mm (bin)</Text>
          </View>

          {/* X-Axis Tick Labels */}
          <View style={styles.xAxisTicksRow}>
            <View style={[styles.yAxisLabelSpacer, { width: 50 }]}>
              <Text style={[styles.axisSubLabel, { color: colors.textMuted }]}>Soil Sat.</Text>
            </View>
            {RAINFALL_BINS.map((bin) => (
              <View key={`x-bin-${bin}`} style={[styles.tickCell, { width: cellSize }]}>
                <Text style={[styles.tickText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {bin}
                </Text>
              </View>
            ))}
          </View>

          {/* Matrix Rows: Soil Saturation Levels */}
          {SOIL_SATURATION_LEVELS.map((soilSat) => (
            <View key={`row-${soilSat}`} style={styles.gridRow}>
              {/* Y-Axis Label */}
              <View style={[styles.yAxisCell, { width: 50 }]}>
                <Text style={[styles.yAxisTickText, { color: colors.textPrimary }]}>{soilSat}%</Text>
              </View>

              {/* Cells */}
              {RAINFALL_BINS.map((rainBin) => {
                const cell = HEATMAP_DATA.find(
                  (d) => d.soilSaturation === soilSat && d.rainfallBin === rainBin
                ) || {
                  rainfallBin: rainBin,
                  soilSaturation: soilSat,
                  incidentCount: 0,
                  earthquakeActivity: 10,
                  riskLevel: 'safe' as const,
                };

                const isSelected = selectedCell?.rainfallBin === rainBin && selectedCell?.soilSaturation === soilSat;
                const isHighlighted = highlightCell && highlightCell.rainfall === rainBin && highlightCell.soilSaturation === soilSat;
                const squareDim = getSquareSize(cell.earthquakeActivity, cellSize);
                const bgFill = getCellColor(cell.incidentCount);

                return (
                  <TouchableOpacity
                    key={`cell-${soilSat}-${rainBin}`}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCell(cell);
                      onCellSelect?.(cell);
                    }}
                    style={[
                      styles.cellContainer,
                      { width: cellSize, height: cellSize },
                      isSelected && { borderColor: colors.steelBlue, borderWidth: 2, borderRadius: 4 },
                      isHighlighted && { borderColor: '#f1c40f', borderWidth: 2, borderRadius: 4 },
                    ]}
                  >
                    <View
                      style={[
                        styles.markerSquare,
                        {
                          width: squareDim,
                          height: squareDim,
                          backgroundColor: bgFill,
                          borderRadius: cell.earthquakeActivity > 25 ? 2 : 1,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Interactive Tooltip Card */}
      {selectedCell ? (
        <View style={[styles.tooltipCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipTitleRow}>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      selectedCell.incidentCount >= 16
                        ? colors.dangerBg
                        : selectedCell.incidentCount >= 8
                        ? colors.warningBg
                        : colors.successBg,
                    borderColor:
                      selectedCell.incidentCount >= 16
                        ? colors.dangerBorder
                        : selectedCell.incidentCount >= 8
                        ? colors.warningBorder
                        : colors.successBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color:
                        selectedCell.incidentCount >= 16
                          ? colors.danger
                          : selectedCell.incidentCount >= 8
                          ? colors.warning
                          : colors.success,
                    },
                  ]}
                >
                  {selectedCell.riskLevel.toUpperCase()} RISK
                </Text>
              </View>
              <Text style={[styles.tooltipSub, { color: colors.textMuted }]}>
                Bin: {selectedCell.rainfallBin}mm Rain • {selectedCell.soilSaturation}% Soil Moisture
              </Text>
            </View>

            <TouchableOpacity onPress={() => setSelectedCell(null)} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{selectedCell.incidentCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Landslide Frequency</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: colors.steelBlue }]}>{selectedCell.earthquakeActivity}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Seismic Shock Idx</Text>
            </View>
            <View style={styles.statCol}>
              <Text
                style={[
                  styles.statVal,
                  {
                    color:
                      selectedCell.incidentCount >= 16
                        ? colors.danger
                        : selectedCell.incidentCount >= 8
                        ? colors.warning
                        : colors.success,
                  },
                ]}
              >
                {((selectedCell.incidentCount / 22) * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Empirical Prob.</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.infoBanner, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <Info size={14} color={colors.steelBlue} />
          <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
            Tap or click any square in the matrix to inspect empirical landslide incidence, soil moisture, and seismic shock.
          </Text>
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
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legendGroup: {
    alignItems: 'flex-end',
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  gradientBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentedGradient: {
    width: 68,
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  legendValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  matrixWrapper: {
    minWidth: 680,
  },
  xAxisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  axisTitleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  xAxisTicksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  yAxisLabelSpacer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  axisSubLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  tickCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    fontSize: 9,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  yAxisCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  yAxisTickText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0.5,
  },
  markerSquare: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tooltipCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tooltipSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 8,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBanner: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoBannerText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
});
