import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import {
  SimulatorInputs,
  simulateLandslideRisk,
  FEATURE_IMPORTANCE,
} from '../../services/analyticsData';
import {
  Cpu,
  Sliders,
  Sparkles,
  CloudRain,
  Mountain,
  Droplets,
  Trees,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react-native';

const PRESETS: { name: string; desc: string; inputs: SimulatorInputs }[] = [
  {
    name: '🔴 Meghalaya Cloudburst & Steep Slope',
    desc: 'Catastrophic torrential monsoon downpour on 48° unreinforced sand cut-slope.',
    inputs: {
      rainfall: 280,
      soilSaturation: 92,
      slopeAngle: 48,
      vegetationCover: 15,
      proximityToWater: 1.2,
      earthquakeActivity: 4.8,
      soilType: 'Sand',
    },
  },
  {
    name: '🟡 Moderate Monsoon on Forested Valley',
    desc: 'Dense oak/pine canopy buffering standard rainfall on mild 22° gradient.',
    inputs: {
      rainfall: 120,
      soilSaturation: 55,
      slopeAngle: 22,
      vegetationCover: 85,
      proximityToWater: 4.5,
      earthquakeActivity: 1.5,
      soilType: 'Gravel',
    },
  },
  {
    name: '⚡ Riverbank Seismic Liquefaction',
    desc: '5.6 Richter tremor near active Brahmaputra tributary with waterlogged silt.',
    inputs: {
      rainfall: 160,
      soilSaturation: 88,
      slopeAngle: 36,
      vegetationCover: 30,
      proximityToWater: 0.8,
      earthquakeActivity: 5.6,
      soilType: 'Silt',
    },
  },
  {
    name: '🟢 Dry Season Stable Highland',
    desc: 'Negligible precipitation, rocky bedrock, low pore-water pressure.',
    inputs: {
      rainfall: 18,
      soilSaturation: 22,
      slopeAngle: 18,
      vegetationCover: 70,
      proximityToWater: 6.2,
      earthquakeActivity: 0.8,
      soilType: 'Gravel',
    },
  },
];

export const MLScenarioSimulator: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const [inputs, setInputs] = useState<SimulatorInputs>(PRESETS[0].inputs);

  const result = simulateLandslideRisk(inputs);

  const updateField = <K extends keyof SimulatorInputs>(key: K, value: SimulatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: colors.subPanel, borderColor: colors.steelBlue }]}>
            <Cpu size={18} color={colors.steelBlue} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Interactive What-If ML Hazard Simulator
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Simulate terrain physics and model risk scoring across 7 environmental parameters
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
          onPress={() => setInputs(PRESETS[0].inputs)}
        >
          <RotateCcw size={13} color={colors.textSecondary} />
          <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset Scenario</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Scenario Quick Selectors */}
      <View style={styles.presetsWrapper}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Quick Test Scenarios:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
          {PRESETS.map((preset, idx) => (
            <TouchableOpacity
              key={`preset-${idx}`}
              activeOpacity={0.8}
              onPress={() => setInputs(preset.inputs)}
              style={[
                styles.presetCard,
                { backgroundColor: colors.subPanel, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.presetTitle, { color: colors.textPrimary }]}>{preset.name}</Text>
              <Text style={[styles.presetDesc, { color: colors.textMuted }]} numberOfLines={2}>
                {preset.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Grid: Controls + Live Risk Output */}
      <View style={styles.mainGrid}>
        {/* Left Column: Parameter Sliders */}
        <View style={styles.controlsCol}>
          {/* 1. Rainfall */}
          <View style={[styles.sliderCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <CloudRain size={16} color={colors.steelBlue} />
                <Text style={[styles.sliderLabel, { color: colors.textPrimary }]}>Precipitation Volume</Text>
              </View>
              <Text style={[styles.sliderVal, { color: colors.steelBlue }]}>{inputs.rainfall} mm</Text>
            </View>
            <View style={styles.rangeRow}>
              {[50, 100, 150, 200, 250, 300, 350].map((v) => (
                <TouchableOpacity
                  key={`rain-v-${v}`}
                  onPress={() => updateField('rainfall', v)}
                  style={[
                    styles.quickValChip,
                    inputs.rainfall === v && { backgroundColor: colors.steelBlue },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickValChipText,
                      { color: inputs.rainfall === v ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. Slope Angle */}
          <View style={[styles.sliderCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <Mountain size={16} color={colors.danger} />
                <Text style={[styles.sliderLabel, { color: colors.textPrimary }]}>Slope Inclination Angle</Text>
              </View>
              <Text style={[styles.sliderVal, { color: colors.danger }]}>{inputs.slopeAngle}°</Text>
            </View>
            <View style={styles.rangeRow}>
              {[15, 25, 35, 42, 50, 58].map((v) => (
                <TouchableOpacity
                  key={`slope-v-${v}`}
                  onPress={() => updateField('slopeAngle', v)}
                  style={[
                    styles.quickValChip,
                    inputs.slopeAngle === v && { backgroundColor: colors.danger },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickValChipText,
                      { color: inputs.slopeAngle === v ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {v}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3. Soil Saturation */}
          <View style={[styles.sliderCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <Droplets size={16} color="#00acc1" />
                <Text style={[styles.sliderLabel, { color: colors.textPrimary }]}>Soil Moisture Saturation</Text>
              </View>
              <Text style={[styles.sliderVal, { color: '#00acc1' }]}>{inputs.soilSaturation}%</Text>
            </View>
            <View style={styles.rangeRow}>
              {[20, 40, 60, 75, 90, 98].map((v) => (
                <TouchableOpacity
                  key={`sat-v-${v}`}
                  onPress={() => updateField('soilSaturation', v)}
                  style={[
                    styles.quickValChip,
                    inputs.soilSaturation === v && { backgroundColor: '#00acc1' },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickValChipText,
                      { color: inputs.soilSaturation === v ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {v}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. Vegetation Cover */}
          <View style={[styles.sliderCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <Trees size={16} color={colors.success} />
                <Text style={[styles.sliderLabel, { color: colors.textPrimary }]}>Vegetation Canopy Density</Text>
              </View>
              <Text style={[styles.sliderVal, { color: colors.success }]}>{inputs.vegetationCover}%</Text>
            </View>
            <View style={styles.rangeRow}>
              {[10, 30, 50, 70, 85, 95].map((v) => (
                <TouchableOpacity
                  key={`veg-v-${v}`}
                  onPress={() => updateField('vegetationCover', v)}
                  style={[
                    styles.quickValChip,
                    inputs.vegetationCover === v && { backgroundColor: colors.success },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickValChipText,
                      { color: inputs.vegetationCover === v ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {v}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 5. Seismic Activity & Water Proximity Row */}
          <View style={styles.twoFieldRow}>
            {/* Seismic Activity */}
            <View style={[styles.halfCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.smallLabel, { color: colors.textPrimary }]}>Seismic Shock</Text>
                <Text style={[styles.sliderVal, { color: colors.danger }]}>{inputs.earthquakeActivity} M</Text>
              </View>
              <View style={styles.miniChipRow}>
                {[1.0, 3.2, 4.8, 6.5, 8.2].map((v) => (
                  <TouchableOpacity
                    key={`quake-v-${v}`}
                    onPress={() => updateField('earthquakeActivity', v)}
                    style={[
                      styles.miniChip,
                      inputs.earthquakeActivity === v && { backgroundColor: colors.danger },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniChipText,
                        { color: inputs.earthquakeActivity === v ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Proximity to Water */}
            <View style={[styles.halfCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.smallLabel, { color: colors.textPrimary }]}>Distance to Water</Text>
                <Text style={[styles.sliderVal, { color: colors.steelBlue }]}>{inputs.proximityToWater} km</Text>
              </View>
              <View style={styles.miniChipRow}>
                {[0.5, 1.5, 3.0, 6.0, 9.5].map((v) => (
                  <TouchableOpacity
                    key={`water-v-${v}`}
                    onPress={() => updateField('proximityToWater', v)}
                    style={[
                      styles.miniChip,
                      inputs.proximityToWater === v && { backgroundColor: colors.steelBlue },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniChipText,
                        { color: inputs.proximityToWater === v ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {v}k
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* 6. Soil Type Selection */}
          <View style={[styles.sliderCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <Text style={[styles.sliderLabel, { color: colors.textPrimary, marginBottom: 8 }]}>
              Subsurface Lithology / Soil Formation
            </Text>
            <View style={styles.soilBtnGroup}>
              {(['Gravel', 'Sand', 'Silt'] as const).map((type) => (
                <TouchableOpacity
                  key={`soil-t-${type}`}
                  onPress={() => updateField('soilType', type)}
                  style={[
                    styles.soilSelectBtn,
                    { borderColor: colors.border },
                    inputs.soilType === type && {
                      backgroundColor: type === 'Sand' ? '#34495e' : type === 'Gravel' ? '#7f8c8d' : '#b0122e',
                      borderColor: '#fff',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.soilSelectText,
                      { color: inputs.soilType === type ? '#fff' : colors.textPrimary },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Right Column: Prediction Score Meter & AI Diagnosis */}
        <View style={[styles.resultCol, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          <Text style={[styles.resultHeaderTitle, { color: colors.textMuted }]}>
            PREDICTIVE MODEL INFERENCE
          </Text>

          {/* Gauge Meter */}
          <View style={styles.meterContainer}>
            <View style={[styles.scoreCircle, { borderColor: result.color }]}>
              <Text style={[styles.scoreNumber, { color: result.color }]}>{result.probability}%</Text>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>SLIDE RISK</Text>
            </View>

            <View style={[styles.categoryBadge, { backgroundColor: `${result.color}20`, borderColor: result.color }]}>
              <Text style={[styles.categoryBadgeText, { color: result.color }]}>
                {result.riskCategory}
              </Text>
            </View>
          </View>

          {/* Feature Contributions Breakdown (SHAP style) */}
          <View style={styles.factorBreakdown}>
            <Text style={[styles.factorTitle, { color: colors.textPrimary }]}>
              Primary Drivers:
            </Text>
            {result.factors.map((factor, idx) => (
              <View key={`factor-${idx}`} style={styles.factorRow}>
                <Text style={[styles.factorName, { color: colors.textSecondary }]}>{factor.name}</Text>
                <View style={styles.factorBarTrack}>
                  <View
                    style={[
                      styles.factorBarFill,
                      {
                        width: `${factor.score}%`,
                        backgroundColor: factor.direction === 'risk' ? result.color : colors.success,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.factorScore,
                    { color: factor.direction === 'risk' ? result.color : colors.success },
                  ]}
                >
                  {factor.direction === 'risk' ? `+${factor.score}%` : `-${factor.score}%`}
                </Text>
              </View>
            ))}
          </View>

          {/* Operational Advisory */}
          <View style={[styles.recBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.recHeader}>
              <AlertTriangle size={14} color={result.color} />
              <Text style={[styles.recTitle, { color: result.color }]}>Safety Recommendation</Text>
            </View>
            <Text style={[styles.recText, { color: colors.textPrimary }]}>
              {result.recommendation}
            </Text>
          </View>
        </View>
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
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 260,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetsWrapper: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  presetsList: {
    gap: 8,
    paddingBottom: 4,
  },
  presetCard: {
    width: 220,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  presetDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  mainGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
  },
  controlsCol: {
    flex: 3,
    gap: 10,
    minWidth: 300,
  },
  sliderCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  sliderVal: {
    fontSize: 13,
    fontWeight: '900',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  quickValChip: {
    flex: 1,
    minWidth: 38,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  quickValChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  twoFieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  miniChipRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  miniChip: {
    flex: 1,
    minWidth: 26,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  miniChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  soilBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  soilSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  soilSelectText: {
    fontSize: 12,
    fontWeight: '800',
  },
  resultCol: {
    flex: 2,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 260,
  },
  resultHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  meterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  factorBreakdown: {
    width: '100%',
    marginBottom: 14,
  },
  factorTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  factorName: {
    fontSize: 10,
    fontWeight: '600',
    width: 90,
  },
  factorBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorScore: {
    fontSize: 10,
    fontWeight: '800',
    width: 36,
    textAlign: 'right',
  },
  recBox: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  recText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
