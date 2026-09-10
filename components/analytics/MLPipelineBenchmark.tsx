import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Cpu, Award, TrendingUp, BarChart2, CheckCircle2, Download, Eye, Layers } from 'lucide-react-native';

export interface ModelBenchmark {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  isBest?: boolean;
}

export const ML_MODELS_BENCHMARK: ModelBenchmark[] = [
  { model: 'Logistic Regression', accuracy: 0.9425, precision: 0.9660, recall: 0.9481, f1: 0.9570, rocAuc: 0.9889, isBest: true },
  { model: 'Extra Trees', accuracy: 0.9350, precision: 0.9453, recall: 0.9593, f1: 0.9522, rocAuc: 0.9800 },
  { model: 'LightGBM', accuracy: 0.9225, precision: 0.9476, recall: 0.9370, f1: 0.9423, rocAuc: 0.9795 },
  { model: 'CatBoost', accuracy: 0.9150, precision: 0.9307, recall: 0.9444, f1: 0.9375, rocAuc: 0.9794 },
  { model: 'XGBoost', accuracy: 0.9250, precision: 0.9478, recall: 0.9407, f1: 0.9442, rocAuc: 0.9769 },
  { model: 'Gradient Boosting', accuracy: 0.9125, precision: 0.9242, recall: 0.9481, f1: 0.9360, rocAuc: 0.9757 },
  { model: 'Random Forest', accuracy: 0.9025, precision: 0.9231, recall: 0.9333, f1: 0.9282, rocAuc: 0.9690 },
];

export const MLPipelineBenchmark: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedArtifact, setSelectedArtifact] = useState<'roc' | 'cm' | 'fi'>('roc');

  const handleDownloadComparisonCSV = () => {
    const csvContent =
      'Model,Accuracy,Precision,Recall,F1 Score,ROC-AUC\n' +
      ML_MODELS_BENCHMARK.map(
        (m) => `${m.model},${m.accuracy},${m.precision},${m.recall},${m.f1},${m.rocAuc}`
      ).join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'landslide_ml_model_comparison.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: colors.subPanel, borderColor: colors.steelBlue }]}>
            <Cpu size={20} color={colors.steelBlue} />
          </View>
          <View>
            <View style={styles.badgeRow}>
              <View style={[styles.mlBadge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                <Text style={[styles.mlBadgeText, { color: colors.success }]}>LANDSLIDE_ML PIPELINE</Text>
              </View>
              <Text style={[styles.subBadgeText, { color: colors.textMuted }]}>7 Ensembles Trained</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Model Evaluation & Diagnostic Benchmarks
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.downloadBtn, { backgroundColor: colors.subPanel, borderColor: colors.border }]}
          onPress={handleDownloadComparisonCSV}
          activeOpacity={0.8}
        >
          <Download size={13} color={colors.steelBlue} />
          <Text style={[styles.downloadBtnText, { color: colors.steelBlue }]}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Top Performer Showcase Card */}
      <View style={[styles.bestModelCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
        <View style={styles.bestModelLeft}>
          <View style={styles.trophyRow}>
            <Award size={18} color="#f59e0b" />
            <Text style={[styles.bestModelTitle, { color: colors.textPrimary }]}>
              Top Performing Architecture: Logistic Regression
            </Text>
          </View>
          <Text style={[styles.bestModelDesc, { color: colors.textSecondary }]}>
            Selected via ROC-AUC priority tiebreaker (0.9889 AUC, 96.6% Precision) for superior discriminative generalization on mountainous terrain.
          </Text>
        </View>

        <View style={styles.bestModelMetrics}>
          <View style={styles.metricPill}>
            <Text style={[styles.metricPillVal, { color: colors.success }]}>94.25%</Text>
            <Text style={[styles.metricPillLbl, { color: colors.textMuted }]}>Accuracy</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={[styles.metricPillVal, { color: colors.steelBlue }]}>98.89%</Text>
            <Text style={[styles.metricPillLbl, { color: colors.textMuted }]}>ROC-AUC</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={[styles.metricPillVal, { color: colors.danger }]}>95.70%</Text>
            <Text style={[styles.metricPillLbl, { color: colors.textMuted }]}>F1-Score</Text>
          </View>
        </View>
      </View>

      {/* Benchmark Comparison Table */}
      <Text style={[styles.tableHeaderTitle, { color: colors.textPrimary }]}>
        Multi-Model Leaderboard Comparison
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.tableScroll}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tr, styles.thRow, { backgroundColor: colors.subPanel, borderBottomColor: colors.border }]}>
            <Text style={[styles.th, { width: 170, color: colors.textPrimary }]}>Model Architecture</Text>
            <Text style={[styles.th, { width: 85, color: colors.textPrimary }]}>Accuracy</Text>
            <Text style={[styles.th, { width: 85, color: colors.textPrimary }]}>Precision</Text>
            <Text style={[styles.th, { width: 85, color: colors.textPrimary }]}>Recall</Text>
            <Text style={[styles.th, { width: 85, color: colors.textPrimary }]}>F1-Score</Text>
            <Text style={[styles.th, { width: 95, color: colors.textPrimary }]}>ROC-AUC</Text>
          </View>

          {/* Data Rows */}
          {ML_MODELS_BENCHMARK.map((item, idx) => (
            <View
              key={`bench-${idx}`}
              style={[
                styles.tr,
                { borderBottomColor: colors.borderSoft },
                item.isBest && { backgroundColor: `${colors.success}10` },
              ]}
            >
              <View style={[styles.tdCell, { width: 170, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                {item.isBest && <CheckCircle2 size={13} color={colors.success} />}
                <Text style={[styles.td, { fontWeight: item.isBest ? '900' : '700', color: colors.textPrimary }]}>
                  {item.model}
                </Text>
              </View>

              <Text style={[styles.td, { width: 85, color: colors.textSecondary }]}>
                {(item.accuracy * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.td, { width: 85, color: colors.textSecondary }]}>
                {(item.precision * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.td, { width: 85, color: colors.textSecondary }]}>
                {(item.recall * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.td, { width: 85, color: colors.textSecondary }]}>
                {(item.f1 * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.td, { width: 95, fontWeight: '900', color: item.isBest ? colors.success : colors.steelBlue }]}>
                {(item.rocAuc * 100).toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Visual Diagnostic Artifacts Explorer */}
      <View style={styles.artifactsSection}>
        <View style={styles.artifactsHeaderRow}>
          <Text style={[styles.tableHeaderTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
            Training Artifacts & Visual Diagnostics
          </Text>

          {/* Artifact Selector Tabs */}
          <View style={[styles.artifactTabs, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.artTabBtn, selectedArtifact === 'roc' && { backgroundColor: colors.cardBg }]}
              onPress={() => setSelectedArtifact('roc')}
            >
              <Text style={[styles.artTabText, { color: selectedArtifact === 'roc' ? colors.textPrimary : colors.textMuted }]}>
                ROC Curves
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.artTabBtn, selectedArtifact === 'cm' && { backgroundColor: colors.cardBg }]}
              onPress={() => setSelectedArtifact('cm')}
            >
              <Text style={[styles.artTabText, { color: selectedArtifact === 'cm' ? colors.textPrimary : colors.textMuted }]}>
                Confusion Matrix
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.artTabBtn, selectedArtifact === 'fi' && { backgroundColor: colors.cardBg }]}
              onPress={() => setSelectedArtifact('fi')}
            >
              <Text style={[styles.artTabText, { color: selectedArtifact === 'fi' ? colors.textPrimary : colors.textMuted }]}>
                Feature Importance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Artifact Display */}
        <View style={[styles.artifactImageCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
          {selectedArtifact === 'roc' && (
            <View style={styles.artifactPreview}>
              <Image
                source={require('../../assets/images/ml_artifacts/roc_curve.png')}
                style={styles.artifactImg}
                resizeMode="contain"
              />
              <Text style={[styles.artifactCaption, { color: colors.textSecondary }]}>
                📈 Multi-Model Receiver Operating Characteristic (ROC) Comparison Curves
              </Text>
            </View>
          )}

          {selectedArtifact === 'cm' && (
            <View style={styles.artifactPreview}>
              <Image
                source={require('../../assets/images/ml_artifacts/confusion_matrix.png')}
                style={styles.artifactImg}
                resizeMode="contain"
              />
              <Text style={[styles.artifactCaption, { color: colors.textSecondary }]}>
                🎯 Model Confusion Matrix: True Positive vs. False Positive Verification
              </Text>
            </View>
          )}

          {selectedArtifact === 'fi' && (
            <View style={styles.artifactPreview}>
              <Image
                source={require('../../assets/images/ml_artifacts/feature_importance.png')}
                style={styles.artifactImg}
                resizeMode="contain"
              />
              <Text style={[styles.artifactCaption, { color: colors.textSecondary }]}>
                🌲 Tree Feature Importance Rankings: Rainfall, Slope & Saturation Driving Weights
              </Text>
            </View>
          )}
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
    marginBottom: 14,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  mlBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  mlBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  downloadBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bestModelCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  bestModelLeft: {
    flex: 1,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bestModelTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bestModelDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  bestModelMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  metricPillVal: {
    fontSize: 13,
    fontWeight: '900',
  },
  metricPillLbl: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  tableHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  tableScroll: {
    paddingBottom: 8,
  },
  table: {
    minWidth: 620,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  thRow: {
    paddingVertical: 10,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 11,
  },
  tdCell: {},
  artifactsSection: {
    marginTop: 16,
  },
  artifactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  artifactTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 4,
  },
  artTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  artTabText: {
    fontSize: 10,
    fontWeight: '700',
  },
  artifactImageCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  artifactPreview: {
    width: '100%',
    alignItems: 'center',
  },
  artifactImg: {
    width: '100%',
    height: 320,
    borderRadius: 8,
  },
  artifactCaption: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
});
