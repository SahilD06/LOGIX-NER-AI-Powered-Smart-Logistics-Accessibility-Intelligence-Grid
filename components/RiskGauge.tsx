import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskEvaluation } from '../services/aiEngine';
import { AlertTriangle, CloudRain, Droplets, Mountain } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

interface RiskGaugeProps {
  risk: RiskEvaluation;
  telemetry: any;
  loading?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, telemetry, loading }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Main Risk Card */}
      <View style={[styles.mainCard, { backgroundColor: colors.cardBg, borderColor: isDark ? colors.border : risk.badgeBorder }]}>
        <View style={styles.topRow}>
          <View style={styles.titleWithIcon}>
            <AlertTriangle size={22} color={risk.color} />
            <Text style={[styles.cardHeader, { color: colors.textSecondary }]}>SLOPE SAFETY & HAZARD LEVEL</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: risk.bgColor, borderColor: risk.badgeBorder }]}>
            <Text style={[styles.statusBadgeText, { color: risk.color }]}>{risk.level.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreValue, { color: risk.color }]}>{risk.score}</Text>
          <Text style={[styles.scoreMax, { color: colors.textMuted }]}>/100</Text>
          <View style={styles.probabilityWrapper}>
            <Text style={[styles.probabilityLabel, { color: colors.textSecondary }]}>Estimated Slope Risk</Text>
            <Text style={[styles.probabilityValue, { color: risk.color }]}>{risk.probabilityPercent}%</Text>
          </View>
        </View>

        {/* Dynamic Progress Meter */}
        <View style={[styles.progressBarBackground, { backgroundColor: colors.borderSoft }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.max(5, Math.min(100, risk.score))}%`,
                backgroundColor: risk.color,
              },
            ]}
          />
        </View>

        {/* Advisory Banner */}
        <View style={[styles.advisoryBox, { backgroundColor: risk.bgColor, borderColor: risk.badgeBorder }]}>
          <Text style={[styles.advisoryText, { color: colors.textPrimary }]}>{risk.recommendation}</Text>
        </View>

        {/* Factor Breakdown Grid - Enlarged */}
        <View style={[styles.factorsGrid, { borderTopColor: colors.borderSoft }]}>
          <View style={[styles.factorItem, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.factorHeader}>
              <CloudRain size={16} color={colors.steelBlue} />
              <Text style={[styles.factorName, { color: colors.textSecondary }]}>24h Rainfall</Text>
            </View>
            <Text style={[styles.factorValue, { color: colors.textPrimary }]}>{telemetry?.rain_24h_sum ?? 0} mm</Text>
            <Text style={[styles.factorScore, { color: colors.textMuted }]}>+{risk.factors.rainfallScore} pts</Text>
          </View>

          <View style={[styles.factorItem, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.factorHeader}>
              <Droplets size={16} color={colors.slateGray} />
              <Text style={[styles.factorName, { color: colors.textSecondary }]}>Soil Moisture</Text>
            </View>
            <Text style={[styles.factorValue, { color: colors.textPrimary }]}>{((telemetry?.soil_moisture ?? 0.35) * 100).toFixed(0)}% sat</Text>
            <Text style={[styles.factorScore, { color: colors.textMuted }]}>+{risk.factors.soilScore} pts</Text>
          </View>

          <View style={[styles.factorItem, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.factorHeader}>
              <Mountain size={16} color={colors.taupe} />
              <Text style={[styles.factorName, { color: colors.textSecondary }]}>Slope Baseline</Text>
            </View>
            <Text style={[styles.factorValue, { color: colors.textPrimary }]}>42° Avg</Text>
            <Text style={[styles.factorScore, { color: colors.textMuted }]}>+{risk.factors.slopeScore} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  mainCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  probabilityWrapper: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  probabilityLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  probabilityValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 1,
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  advisoryBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  advisoryText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  factorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 14,
    flexWrap: 'wrap',
  },
  factorItem: {
    flex: 1,
    minWidth: 90,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  factorName: {
    fontSize: 11,
    fontWeight: '700',
  },
  factorValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  factorScore: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});
