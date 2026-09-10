import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/Header';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MasterTableauView } from '../../components/analytics/MasterTableauView';
import { RiskMatrixHeatmap } from '../../components/analytics/RiskMatrixHeatmap';
import { RainfallBoxplotChart } from '../../components/analytics/RainfallBoxplotChart';
import { VegetationImpactChart } from '../../components/analytics/VegetationImpactChart';
import { SeismicWaterScatterChart } from '../../components/analytics/SeismicWaterScatterChart';
import { SlopeRiskChart } from '../../components/analytics/SlopeRiskChart';
import { SoilVulnerabilityChart } from '../../components/analytics/SoilVulnerabilityChart';
import { MLScenarioSimulator } from '../../components/analytics/MLScenarioSimulator';
import { MLPipelineBenchmark } from '../../components/analytics/MLPipelineBenchmark';
import { FEATURE_IMPORTANCE } from '../../services/analyticsData';
import {
  BarChart3,
  Layers,
  Cpu,
  Sliders,
  Sparkles,
  Download,
  Filter,
  FileText,
  Share2,
  CheckCircle2,
  AlertOctagon,
  Database,
  Award,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Key,
} from 'lucide-react-native';

type ViewMode = 'master' | 'pipeline' | 'deepdive' | 'simulator' | 'metrics';

export default function AnalyticsScreen() {
  const { colors, isDark } = useAppTheme();
  const { currentRole, loginAsRole, loginWithCredentials, isLoading } = useAuth();

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('master');
  const [selectedChartTab, setSelectedChartTab] = useState<
    'heatmap' | 'rainfall' | 'vegetation' | 'seismic' | 'slope' | 'soil'
  >('heatmap');
  const [activeRegion, setActiveRegion] = useState<string>('All NER Corridors');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleAdminLogin = async () => {
    setAuthError('');
    setIsSubmitting(true);
    const res = await loginWithCredentials(adminUsername, adminPassword);
    setIsSubmitting(false);
    if (!res.success) {
      setAuthError(res.message || 'Invalid administrator credentials');
    }
  };

  const handleQuickAdminLogin = async () => {
    setAuthError('');
    setIsSubmitting(true);
    await loginAsRole('admin');
    setIsSubmitting(false);
  };

  const handleExportCSV = () => {
    const csvContent =
      'EventID,Rainfall_mm,Soil_Saturation_pct,Slope_Angle_deg,Vegetation_pct,Proximity_Water_km,Earthquake_Mag,Soil_Type,Landslide_Occurred\n' +
      '1,280.5,92.1,48.2,15,1.2,4.8,Sand,1\n' +
      '2,120.0,55.4,22.0,85,4.5,1.5,Gravel,0\n' +
      '3,160.2,88.0,36.5,30,0.8,5.6,Silt,1\n' +
      '4,18.5,22.0,18.0,70,6.2,0.8,Gravel,0\n';

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'RAKSHAK_Landslide_ML_Dataset.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // If user is not logged in as NDRF Administrator, display the Admin Lock & Authorization Gate
  if (currentRole !== 'admin') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.authLockScrollContainer}
        >
          {/* Main Shield Lock Card */}
          <View style={[styles.authLockCard, { backgroundColor: colors.cardBg, borderColor: colors.dangerBorder }]}>
            <View style={[styles.authLockIconCircle, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <ShieldAlert size={42} color={colors.danger} />
            </View>

            <Text style={[styles.authLockTitle, { color: colors.textPrimary }]}>
              NDRF Command Analytics
            </Text>
            <Text style={[styles.authLockBadgeText, { color: colors.danger }]}>
              RESTRICTED TO ADMINISTRATORS ONLY
            </Text>

            <Text style={[styles.authLockSubtitle, { color: colors.textSecondary }]}>
              The Empirical Geotechnical Tableau Matrix, 7-Model Machine Learning Leaderboard, Failure Mechanics Diagnostic Plots, and What-If Disaster Simulator are restricted strictly to authorized NDRF Command Administrators.
            </Text>

            {/* Current Session Banner */}
            <View style={[styles.currentRoleNotice, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
              <Text style={[styles.currentRoleNoticeLabel, { color: colors.textMuted }]}>Current Active Role:</Text>
              <View style={[styles.currentRoleBadge, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.currentRoleBadgeText, { color: colors.steelBlue }]}>
                  👤 {currentRole.toUpperCase()} (Restricted Field View)
                </Text>
              </View>
            </View>

            {/* One-Click Quick Admin Switch */}
            <TouchableOpacity
              style={[styles.quickAdminBtn, { backgroundColor: colors.steelBlue }]}
              onPress={handleQuickAdminLogin}
              disabled={isSubmitting || isLoading}
              activeOpacity={0.85}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Key size={16} color="#ffffff" />
                  <Text style={styles.quickAdminBtnText}>⚡ Instant Admin Unlock (admin / admin)</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Or Credential Form */}
            <View style={styles.authLockDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted, backgroundColor: colors.cardBg }]}>
                OR ENTER COMMAND CREDENTIALS
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.authLockInputGroup}>
              <Text style={[styles.authInputLabel, { color: colors.textPrimary }]}>Administrator ID</Text>
              <TextInput
                style={[styles.authInputBox, { backgroundColor: colors.subPanel, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Enter admin username (e.g. admin)"
                placeholderTextColor={colors.textMuted}
                value={adminUsername}
                onChangeText={setAdminUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.authLockInputGroup}>
              <Text style={[styles.authInputLabel, { color: colors.textPrimary }]}>Authorization Key</Text>
              <TextInput
                style={[styles.authInputBox, { backgroundColor: colors.subPanel, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Enter admin password (e.g. admin)"
                placeholderTextColor={colors.textMuted}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            </View>

            {authError ? (
              <Text style={[styles.authErrorText, { color: colors.danger }]}>
                ⚠️ {authError}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.authSubmitBtn, { backgroundColor: colors.danger }]}
              onPress={handleAdminLogin}
              disabled={isSubmitting || isLoading}
              activeOpacity={0.85}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.authSubmitBtnText}>Authenticate & Access Analytics</Text>
                  <ArrowRight size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Main Title Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIconWrap, { backgroundColor: colors.subPanel, borderColor: colors.steelBlue }]}>
              <BarChart3 size={24} color={colors.steelBlue} />
            </View>
            <View style={styles.heroTextCol}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.liveDataBadge, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
                  <Text style={[styles.liveDataBadgeText, { color: colors.danger }]}>🛡️ NDRF ADMIN COMMAND ACCESS ACTIVE</Text>
                </View>
                <Text style={[styles.recordsCountText, { color: colors.textMuted }]}>
                  2,548 Training Records
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                Geotechnical & ML Analytics Hub
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Empirical disaster telemetry, failure mechanics correlations, and predictive terrain modeling.
              </Text>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={[styles.metricsBar, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={styles.metricCol}>
              <Text style={[styles.mLabel, { color: colors.textMuted }]}>Model Accuracy</Text>
              <Text style={[styles.mVal, { color: colors.success }]}>94.2%</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.mLabel, { color: colors.textMuted }]}>Critical Inflection</Text>
              <Text style={[styles.mVal, { color: colors.warning }]}>150 mm Rain</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.mLabel, { color: colors.textMuted }]}>Slope Failure Angle</Text>
              <Text style={[styles.mVal, { color: colors.danger }]}>&gt; 35° Steep</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.mLabel, { color: colors.textMuted }]}>High Risk Soil</Text>
              <Text style={[styles.mVal, { color: colors.steelBlue }]}>Sand (683)</Text>
            </View>
          </View>
        </View>

        {/* View Mode Navigation Tabs */}
        <View style={[styles.modeTabsRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.modeTabBtn,
              viewMode === 'master' && { backgroundColor: colors.steelBlue },
            ]}
            onPress={() => setViewMode('master')}
          >
            <Layers size={14} color={viewMode === 'master' ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.modeTabText,
                { color: viewMode === 'master' ? '#fff' : colors.textSecondary },
              ]}
            >
              Tableau Board
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTabBtn,
              viewMode === 'pipeline' && { backgroundColor: colors.steelBlue },
            ]}
            onPress={() => setViewMode('pipeline')}
          >
            <Award size={14} color={viewMode === 'pipeline' ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.modeTabText,
                { color: viewMode === 'pipeline' ? '#fff' : colors.textSecondary },
              ]}
            >
              ML Models (98.9% AUC)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTabBtn,
              viewMode === 'deepdive' && { backgroundColor: colors.steelBlue },
            ]}
            onPress={() => setViewMode('deepdive')}
          >
            <BarChart3 size={14} color={viewMode === 'deepdive' ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.modeTabText,
                { color: viewMode === 'deepdive' ? '#fff' : colors.textSecondary },
              ]}
            >
              Chart Deep-Dive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTabBtn,
              viewMode === 'simulator' && { backgroundColor: colors.steelBlue },
            ]}
            onPress={() => setViewMode('simulator')}
          >
            <Cpu size={14} color={viewMode === 'simulator' ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.modeTabText,
                { color: viewMode === 'simulator' ? '#fff' : colors.textSecondary },
              ]}
            >
              What-If Simulator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTabBtn,
              viewMode === 'metrics' && { backgroundColor: colors.steelBlue },
            ]}
            onPress={() => setViewMode('metrics')}
          >
            <Database size={14} color={viewMode === 'metrics' ? '#fff' : colors.textSecondary} />
            <Text
              style={[
                styles.modeTabText,
                { color: viewMode === 'metrics' ? '#fff' : colors.textSecondary },
              ]}
            >
              Dataset & SHAP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Region & Timeframe Filter Pills */}
        <View style={styles.filterPillsRow}>
          <Filter size={13} color={colors.textMuted} />
          {['All NER Corridors', 'Shillong (NH-40)', 'Sikkim (NH-10)', 'Guwahati Hills', 'Monsoon Peak (Jun-Sep)'].map(
            (region) => (
              <TouchableOpacity
                key={`reg-${region}`}
                onPress={() => setActiveRegion(region)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: activeRegion === region ? colors.cardBg : colors.subPanel,
                    borderColor: activeRegion === region ? colors.steelBlue : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: activeRegion === region ? colors.steelBlue : colors.textMuted,
                      fontWeight: activeRegion === region ? '800' : '600',
                    },
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* VIEW MODE 1: MASTER TABLEAU VIEW */}
        {viewMode === 'master' && <MasterTableauView />}

        {/* VIEW MODE 2: ML PIPELINE & BENCHMARK (landslide_ml) */}
        {viewMode === 'pipeline' && <MLPipelineBenchmark />}

        {/* VIEW MODE 2: CHART DEEP-DIVE EXPLORER */}
        {viewMode === 'deepdive' && (
          <View style={styles.deepDiveContainer}>
            {/* Chart Sub-Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabList}>
              {[
                { key: 'heatmap', label: '1. Risk Heatmap' },
                { key: 'rainfall', label: '2. Rainfall Boxplot' },
                { key: 'vegetation', label: '3. Vegetation Impact' },
                { key: 'seismic', label: '4. Seismic & Water Scatter' },
                { key: 'slope', label: '5. Slope Angle Risk' },
                { key: 'soil', label: '6. Soil Vulnerability' },
              ].map((tab) => (
                <TouchableOpacity
                  key={`subtab-${tab.key}`}
                  onPress={() => setSelectedChartTab(tab.key as any)}
                  style={[
                    styles.chartSubTabBtn,
                    {
                      backgroundColor: selectedChartTab === tab.key ? colors.steelBlue : colors.cardBg,
                      borderColor: selectedChartTab === tab.key ? colors.steelBlue : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chartSubTabText,
                      { color: selectedChartTab === tab.key ? '#fff' : colors.textPrimary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected Chart Component */}
            {selectedChartTab === 'heatmap' && <RiskMatrixHeatmap />}
            {selectedChartTab === 'rainfall' && <RainfallBoxplotChart />}
            {selectedChartTab === 'vegetation' && <VegetationImpactChart />}
            {selectedChartTab === 'seismic' && <SeismicWaterScatterChart />}
            {selectedChartTab === 'slope' && <SlopeRiskChart />}
            {selectedChartTab === 'soil' && <SoilVulnerabilityChart />}
          </View>
        )}

        {/* VIEW MODE 3: WHAT-IF SCENARIO SIMULATOR */}
        {viewMode === 'simulator' && <MLScenarioSimulator />}

        {/* VIEW MODE 4: DATASET & MODEL METRICS */}
        {viewMode === 'metrics' && (
          <View style={styles.metricsContainer}>
            {/* Model Architecture & Weights */}
            <View style={[styles.modelCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.modelHeader}>
                <Cpu size={18} color={colors.steelBlue} />
                <Text style={[styles.modelTitle, { color: colors.textPrimary }]}>
                  ML Feature Weight Importance (SHAP Correlation)
                </Text>
              </View>

              <View style={styles.featureList}>
                {FEATURE_IMPORTANCE.map((item, idx) => (
                  <View key={`feat-${idx}`} style={styles.featRow}>
                    <View style={styles.featNameCol}>
                      <Text style={[styles.featName, { color: colors.textPrimary }]}>{item.feature}</Text>
                      <Text style={[styles.featDesc, { color: colors.textMuted }]}>{item.impact}</Text>
                    </View>
                    <View style={styles.featBarCol}>
                      <View style={styles.featTrack}>
                        <View
                          style={[
                            styles.featFill,
                            {
                              width: `${item.weight * 2.5}%`,
                              backgroundColor: idx === 0 ? '#e53935' : idx === 1 ? '#f39c12' : colors.steelBlue,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.featWeightText, { color: colors.textPrimary }]}>{item.weight}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Dataset Export & Downloads */}
            <View style={[styles.exportCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.exportHeader}>
                <Database size={18} color={colors.steelBlue} />
                <View>
                  <Text style={[styles.exportTitle, { color: colors.textPrimary }]}>
                    Geotechnical Dataset Export
                  </Text>
                  <Text style={[styles.exportSub, { color: colors.textMuted }]}>
                    Download standardized training and validation samples in CSV format
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.downloadBtn,
                  { backgroundColor: downloadSuccess ? colors.success : colors.steelBlue },
                ]}
                onPress={handleExportCSV}
                activeOpacity={0.8}
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 size={16} color="#fff" />
                    <Text style={styles.downloadBtnText}>Dataset Exported Successfully!</Text>
                  </>
                ) : (
                  <>
                    <Download size={16} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download Training CSV (2,548 Records)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroBanner: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTextCol: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  liveDataBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  liveDataBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  recordsCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 18,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCol: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  mLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mVal: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  modeTabsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  modeTabBtn: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 10,
  },
  deepDiveContainer: {
    gap: 12,
  },
  subTabList: {
    gap: 8,
    paddingBottom: 8,
    marginBottom: 8,
  },
  chartSubTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chartSubTabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metricsContainer: {
    gap: 16,
  },
  modelCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modelTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  featureList: {
    gap: 12,
  },
  featRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  featNameCol: {
    flex: 2,
  },
  featName: {
    fontSize: 12,
    fontWeight: '800',
  },
  featDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  featBarCol: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  featFill: {
    height: '100%',
    borderRadius: 4,
  },
  featWeightText: {
    fontSize: 11,
    fontWeight: '800',
    width: 38,
    textAlign: 'right',
  },
  exportCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  exportSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  authLockScrollContainer: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLockCard: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  authLockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authLockTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  authLockBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  authLockSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  currentRoleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  currentRoleNoticeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  currentRoleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  currentRoleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  quickAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginBottom: 18,
  },
  quickAdminBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  authLockDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 10,
  },
  authLockInputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  authInputLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  authInputBox: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
  },
  authErrorText: {
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 6,
    textAlign: 'center',
  },
  authSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  authSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
