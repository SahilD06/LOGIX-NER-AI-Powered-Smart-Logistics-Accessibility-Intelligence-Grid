import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { RiskMatrixHeatmap } from './RiskMatrixHeatmap';
import { SlopeRiskChart } from './SlopeRiskChart';
import { VegetationImpactChart } from './VegetationImpactChart';
import { SoilVulnerabilityChart } from './SoilVulnerabilityChart';
import { RainfallBoxplotChart } from './RainfallBoxplotChart';
import { SeismicWaterScatterChart } from './SeismicWaterScatterChart';
import { Sparkles, Layers, ShieldAlert, Cpu } from 'lucide-react-native';

export const MasterTableauView: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Tableau Board Banner */}
      <View style={[styles.boardHeader, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
        <View style={styles.boardTitleRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
            <Layers size={18} color={colors.danger} />
          </View>
          <View>
            <Text style={[styles.boardMainTitle, { color: colors.textPrimary }]}>
              Unified Landslide Risk & Geotechnical Master Board
            </Text>
            <Text style={[styles.boardSubTitle, { color: colors.textMuted }]}>
              Multi-dimensional cross-correlation of 2,500+ geological monitoring records across the Northeast India terrain
            </Text>
          </View>
        </View>

        <View style={[styles.statPillsRow]}>
          <View style={[styles.statPill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.steelBlue }]}>2,548</Text>
            <Text style={[styles.pillLbl, { color: colors.textMuted }]}>Events Sampled</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.danger }]}>74.8%</Text>
            <Text style={[styles.pillLbl, { color: colors.textMuted }]}>Critical Slope Hazard</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.success }]}>93.8%</Text>
            <Text style={[styles.pillLbl, { color: colors.textMuted }]}>Model Confidence</Text>
          </View>
        </View>
      </View>

      {/* Grid Layout Container */}
      <View style={styles.gridLayout}>
        {/* Top: Heatmap */}
        <RiskMatrixHeatmap />

        {/* Middle Two-Column Grid: Slope Angle vs Landslide Risk & Soil Type Vulnerability */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <SlopeRiskChart />
          </View>
          <View style={styles.colHalf}>
            <SoilVulnerabilityChart />
          </View>
        </View>

        {/* Middle: Vegetation Impact */}
        <VegetationImpactChart />

        {/* Bottom Two-Column Grid: Rainfall Boxplot & Seismic Scatter */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <RainfallBoxplotChart />
          </View>
          <View style={styles.colHalf}>
            <SeismicWaterScatterChart />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boardHeader: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  boardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  boardSubTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 620,
    lineHeight: 16,
  },
  statPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  pillNum: {
    fontSize: 13,
    fontWeight: '900',
  },
  pillLbl: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridLayout: {
    gap: 4,
  },
  twoColRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    flexWrap: 'wrap',
  },
  colHalf: {
    flex: 1,
    minWidth: 320,
  },
});
