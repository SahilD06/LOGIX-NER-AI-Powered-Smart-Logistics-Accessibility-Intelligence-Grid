import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Activity,
  Zap,
  Radio,
  PhoneCall,
  Flame,
  Search,
  RefreshCw,
  Share2,
  Compass,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  DISTRICT_ACCESSIBILITY_DATA,
  ESSENTIAL_CONVOYS,
  ISOLATED_VILLAGES_DATA,
  getAIRouteOptimization,
  triggerMultiChannelIVRAlert,
  EssentialConvoy,
  DistrictAccessibilityStatus,
  IsolatedVillage,
} from '../services/logisticsService';

interface LogisticsTrackerProps {
  simulatedDanger?: boolean;
  onSimulateDanger?: () => void;
}

export function LogisticsTracker({
  simulatedDanger = false,
  onSimulateDanger,
}: LogisticsTrackerProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'convoys' | 'ai_routing' | 'isolated_villages' | 'alerts'>('convoys');
  const [selectedCorridor, setSelectedCorridor] = useState('NH-10 Sevoke');
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalDemoActive, setInternalDemoActive] = useState(false);
  const [ivrFeedback, setIvrFeedback] = useState<string | null>(null);

  const demoLandslideActive = simulatedDanger || internalDemoActive;

  const routeMapRef = useRef<any>(null);

  const aiRouteData = getAIRouteOptimization(selectedCorridor, isDisasterMode);

  // Render Leaflet Route Map Polylines when AI Routing tab is active
  useEffect(() => {
    if (activeTab !== 'ai_routing' || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      const win = window as any;
      const L = win.L;
      const mapElem = document.getElementById('ai-route-leaflet-map');
      if (!L || !mapElem) return;

      if (routeMapRef.current) {
        routeMapRef.current.remove();
        routeMapRef.current = null;
      }

      // First candidate start coords or default center
      const firstCoords = aiRouteData.graphCandidates[0]?.waypointCoords[0] || [26.89, 88.47];
      const map = L.map('ai-route-leaflet-map', {
        center: firstCoords,
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      // Plot all route candidates as colored polylines
      const bounds: [number, number][] = [];
      aiRouteData.graphCandidates.forEach((cand) => {
        if (cand.waypointCoords && cand.waypointCoords.length > 0) {
          const polyline = L.polyline(cand.waypointCoords, {
            color: cand.routeColor,
            weight: cand.isPrimary ? 5 : 4,
            opacity: 0.9,
            dashArray: cand.isPrimary ? '8, 8' : undefined,
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
              <b style="color: ${cand.routeColor}">${cand.title}</b><br/>
              Distance: ${cand.totalDistanceKm} km | ETA: ${cand.etaMinutes} mins | Risk: ${cand.disruptionRiskPct}%
            </div>
          `);

          cand.waypointCoords.forEach((pt) => {
            bounds.push(pt);
            // Add waypoint markers
            L.circleMarker(pt, {
              radius: 5,
              color: cand.routeColor,
              fillColor: '#ffffff',
              fillOpacity: 1,
            }).addTo(map);
          });
        }
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }

      routeMapRef.current = map;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (routeMapRef.current) {
        routeMapRef.current.remove();
        routeMapRef.current = null;
      }
    };
  }, [activeTab, selectedCorridor, isDisasterMode]);

  // Filter convoys
  const convoysList = ESSENTIAL_CONVOYS.map((c) => {
    if (c.id === 'CONVOY-MED-01' && demoLandslideActive) {
      return {
        ...c,
        status: 'Rerouted (Bypass)' as const,
        route: 'AI BYPASS: Lava — Reshi Pass Corridor',
        locationName: 'Rerouted past Teesta Landslide via Lava Pass',
        etaMinutes: 145,
        delayHours: 0.8,
        alternateRouteSuggested: 'Reroute active: Lava — Reshi Pass Clear Pass',
      };
    }
    return c;
  });

  const filteredConvoys = convoysList.filter(
    (c) =>
      c.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateLandslideReroute = () => {
    if (onSimulateDanger) {
      onSimulateDanger();
    } else {
      setInternalDemoActive((prev) => !prev);
    }
  };

  const handleTriggerIVR = (phone: string, villageName: string) => {
    const res = triggerMultiChannelIVRAlert(phone, `EMERGENCY ALERT: Air drop supply convoy dispatched to ${villageName}`);
    setIvrFeedback(`📢 Dispatching Multi-Channel Alert (SMS + IVR Call ID: ${res.ivrCallId}) to ${villageName} responders!`);
    setTimeout(() => setIvrFeedback(null), 6000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.subPanel, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.steelBlue + '25', borderColor: colors.steelBlue + '50' }]}>
            <Truck size={22} color={colors.steelBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.logisticsTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t.logisticsSub}
            </Text>
          </View>
        </View>

        {/* 4 Named Centralized Dashboard Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'convoys' && { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }]}
            onPress={() => setActiveTab('convoys')}
            activeOpacity={0.8}
          >
            <Truck size={14} color={activeTab === 'convoys' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'convoys' ? '#FFFFFF' : colors.textSecondary }]}>
              {t.tabConvoyFleet} ({ESSENTIAL_CONVOYS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ai_routing' && { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }]}
            onPress={() => setActiveTab('ai_routing')}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color={activeTab === 'ai_routing' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'ai_routing' ? '#FFFFFF' : colors.textSecondary }]}>
              {t.tabAiRouting}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'isolated_villages' && { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }]}
            onPress={() => setActiveTab('isolated_villages')}
            activeOpacity={0.8}
          >
            <MapPin size={14} color={activeTab === 'isolated_villages' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'isolated_villages' ? '#FFFFFF' : colors.textSecondary }]}>
              {t.tabIsolatedVillages} ({ISOLATED_VILLAGES_DATA.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'alerts' && { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }]}
            onPress={() => setActiveTab('alerts')}
            activeOpacity={0.8}
          >
            <Radio size={14} color={activeTab === 'alerts' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'alerts' ? '#FFFFFF' : colors.textSecondary }]}>
              {t.tabIvrAlerts}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* DASHBOARD 1: GPS Convoy Tracking & Live Reroute Demo */}
      {activeTab === 'convoys' && (
        <View style={styles.sectionPadding}>
          {/* Live Reroute Wow Demo Banner */}
          <View style={[styles.demoBanner, { backgroundColor: demoLandslideActive ? colors.warningBg : colors.subPanel, borderColor: demoLandslideActive ? colors.warningBorder : colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.demoBannerTitle, { color: demoLandslideActive ? colors.warning : colors.textPrimary }]}>
                {demoLandslideActive ? `⚡ ${t.reRouteAdviceTitle}` : `🚛 ${t.activeConvoysCard}`}
              </Text>
              <Text style={[styles.demoBannerSub, { color: colors.textSecondary }]}>
                {demoLandslideActive
                  ? t.responseRoad
                  : t.logisticsSub}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.demoBtn,
                { backgroundColor: demoLandslideActive ? colors.success : colors.danger },
              ]}
              onPress={handleSimulateLandslideReroute}
              activeOpacity={0.8}
            >
              <Zap size={14} color="#ffffff" />
              <Text style={styles.demoBtnText}>
                {demoLandslideActive ? t.resetSimulation : `🔺 ${t.simulateLandslide}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarRow}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  color: colors.textPrimary,
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
              placeholder={t.searchConvoyPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.convoyListScroll} showsVerticalScrollIndicator={false}>
            {filteredConvoys.map((convoy) => {
              const isRerouted = convoy.status === 'Rerouted (Bypass)';
              const isDelayed = convoy.status === 'Delayed (Landslide)';
              const isUrgentMedical = convoy.cargoType === 'Medicines & Oxygen';

              const badgeColor = isRerouted
                ? colors.success
                : isDelayed
                ? colors.danger
                : colors.steelBlue;

              const cardLeftColor = isUrgentMedical || isDelayed
                ? colors.danger
                : isRerouted
                ? colors.success
                : colors.steelBlue;

              return (
                <View
                  key={convoy.id}
                  style={[
                    styles.convoyCard,
                    {
                      backgroundColor: isDark ? '#111827' : '#FFFFFF',
                      borderColor: isRerouted ? colors.successBorder : isDelayed ? colors.dangerBorder : isDark ? '#1F2937' : '#E2E8F0',
                      borderLeftWidth: 4,
                      borderLeftColor: cardLeftColor,
                    },
                  ]}
                >
                  <View style={styles.convoyCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.cargoIcon}>{convoy.cargoIcon}</Text>
                      <View>
                        <Text style={[styles.cargoTitle, { color: colors.textPrimary }]}>
                          {convoy.cargoType}
                        </Text>
                        <Text style={[styles.vehicleNo, { color: colors.textMuted }]}>
                          {convoy.vehicleNo} • Driver: {convoy.driverName}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor, borderColor: badgeColor }]}>
                      <Text style={[styles.statusBadgeText, { color: '#ffffff' }]}>
                        {convoy.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routeDetailsRow}>
                    <View style={styles.routeCol}>
                      <Text style={[styles.routeLabel, { color: colors.textMuted }]}>Origin ➔ Destination</Text>
                      <Text style={[styles.routeVal, { color: colors.textPrimary }]}>
                        {convoy.origin} ➔ {convoy.destination}
                      </Text>
                    </View>
                    <View style={styles.routeCol}>
                      <Text style={[styles.routeLabel, { color: colors.textMuted }]}>Live GPS Location</Text>
                      <Text style={[styles.routeVal, { color: colors.textPrimary }]}>
                        📍 {convoy.locationName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Clock size={13} color={colors.steelBlue} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        ETA: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{convoy.etaMinutes} mins</Text>
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Zap size={13} color={colors.warning} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        Delay: <Text style={{ color: colors.danger, fontWeight: '800' }}>+{convoy.delayHours} hrs</Text>
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Activity size={13} color={colors.success} />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        Speed: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{convoy.speedKmH} km/h</Text>
                      </Text>
                    </View>
                  </View>

                  {convoy.alternateRouteSuggested && (
                    <View style={[styles.bypassAlertBox, { backgroundColor: isDark ? 'rgba(6, 78, 59, 0.4)' : '#ECFDF5', borderColor: colors.success }]}>
                      <Navigation size={16} color={colors.success} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: colors.success, letterSpacing: 0.5, marginBottom: 2 }}>
                          ⚡ AI DYNAMIC BYPASS ROUTE OUTPUT
                        </Text>
                        <Text style={[styles.bypassAlertText, { color: colors.textPrimary }]}>
                          {convoy.alternateRouteSuggested}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* DASHBOARD 2: AI Route Optimization & Dynamic Graph Engine */}
      {activeTab === 'ai_routing' && (
        <View style={styles.sectionPadding}>
          {/* Corridor Selection & Disaster Toggle */}
          <View style={styles.corridorSelectorRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['NH-10 Sevoke', 'NH-6 Shillong', 'NH-27 Haflong'].map((corr) => (
                <TouchableOpacity
                  key={corr}
                  style={[
                    styles.corridorChip,
                    {
                      backgroundColor: selectedCorridor === corr ? colors.steelBlue : isDark ? '#1F2937' : '#F1F5F9',
                      borderColor: selectedCorridor === corr ? colors.steelBlue : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCorridor(corr)}
                >
                  <Text style={[styles.corridorChipText, { color: selectedCorridor === corr ? '#FFFFFF' : colors.textPrimary }]}>
                    {corr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.disasterToggleBtn,
                {
                  backgroundColor: isDisasterMode ? colors.danger : colors.subPanel,
                  borderColor: isDisasterMode ? colors.danger : colors.border,
                },
              ]}
              onPress={() => setIsDisasterMode((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Flame size={14} color={isDisasterMode ? '#ffffff' : colors.danger} />
              <Text style={[styles.disasterToggleText, { color: isDisasterMode ? '#ffffff' : colors.textPrimary }]}>
                {isDisasterMode ? 'Disaster Mode ON' : 'Emergency Mode'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.aiSummaryCard, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={[styles.corridorTitle, { color: colors.textPrimary }]}>
                {aiRouteData.corridorName}
              </Text>
              <View style={[styles.scoreBadge, { backgroundColor: colors.steelBlue + '20', borderColor: colors.steelBlue }]}>
                <Text style={[styles.scoreText, { color: colors.steelBlue }]}>
                  Accessibility: {aiRouteData.accessibilityScore}/100
                </Text>
              </View>
            </View>

            <Text style={[styles.terrainText, { color: colors.textSecondary }]}>
              {aiRouteData.terrainCondition}
            </Text>
          </View>

          <Text style={[styles.sectionTitleHeader, { color: colors.textPrimary }]}>
            🧠 Dynamic Graph Shortest-Path & Risk-Adjusted Candidates
          </Text>

          {/* Interactive GIS Route Visualizer Map */}
          <View style={[styles.routeMapContainer, { borderColor: colors.border }]}>
            <View style={[styles.routeMapHeader, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} color={colors.steelBlue} />
                <Text style={[styles.routeMapHeaderTitle, { color: colors.textPrimary }]}>
                  Live GIS Path Polylines (Real Map Coordinates)
                </Text>
              </View>
              <Text style={[styles.routeMapHeaderSub, { color: colors.textSecondary }]}>
                Red = Blocked • Green = AI Bypass • Amber = Tactical
              </Text>
            </View>

            {Platform.OS === 'web' ? (
              <div
                id="ai-route-leaflet-map"
                style={{
                  width: '100%',
                  height: '240px',
                  borderRadius: '0 0 12px 12px',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                }}
              />
            ) : (
              <View style={styles.mobileMapFallback}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>GIS Route Map Active</Text>
              </View>
            )}
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {aiRouteData.graphCandidates.map((cand) => (
              <View
                key={cand.id}
                style={[
                  styles.candidateCard,
                  {
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderColor: cand.isPrimary ? colors.dangerBorder : colors.successBorder,
                  },
                ]}
              >
                <View style={styles.candidateHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.routeDot, { backgroundColor: cand.routeColor }]} />
                    <Text style={[styles.candidateTitle, { color: colors.textPrimary }]}>
                      {cand.title}
                    </Text>
                  </View>
                  <Text style={[styles.riskTag, { color: cand.disruptionRiskPct > 50 ? colors.danger : colors.success }]}>
                    Risk: {cand.disruptionRiskPct}%
                  </Text>
                </View>

                <View style={styles.nodePathBox}>
                  <Text style={[styles.nodePathText, { color: colors.steelBlue }]}>
                    Graph Path: {cand.pathNodes.join(' ➔ ')}
                  </Text>
                </View>

                <View style={styles.candMetaRow}>
                  <Text style={[styles.candMetaText, { color: colors.textSecondary }]}>
                    Distance: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{cand.totalDistanceKm} km</Text>
                  </Text>
                  <Text style={[styles.candMetaText, { color: colors.textSecondary }]}>
                    ETA: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{cand.etaMinutes} mins</Text>
                  </Text>
                  <Text style={[styles.candMetaText, { color: colors.textSecondary }]}>
                    Delay: <Text style={{ color: colors.danger, fontWeight: '700' }}>+{cand.delayHours}h</Text>
                  </Text>
                </View>

                <Text style={[styles.candDesc, { color: colors.textMuted }]}>
                  {cand.description}
                </Text>

                {/* Google Maps Turn-by-Turn Direct Link */}
                <TouchableOpacity
                  style={[styles.googleMapsBtn, { backgroundColor: cand.isPrimary ? colors.danger : colors.steelBlue }]}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open(cand.googleMapsUrl, '_blank');
                    } else {
                      Linking.openURL(cand.googleMapsUrl);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Navigation size={14} color="#ffffff" />
                  <Text style={styles.googleMapsBtnText}>
                    Open Turn-by-Turn Navigation in Google Maps 🗺️
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* DASHBOARD 3: Isolated Villages & Bottleneck Intelligence */}
      {activeTab === 'isolated_villages' && (
        <View style={styles.sectionPadding}>
          <Text style={[styles.sectionTitleHeader, { color: colors.textPrimary }]}>
            Isolated Settlement & Supply Priority Matrix
          </Text>
          <Text style={[styles.sectionSubHeader, { color: colors.textSecondary }]}>
            Villages with zero accessible road routes ranked by urgency index (Population × Days Isolated × Stock Need)
          </Text>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {ISOLATED_VILLAGES_DATA.map((vill) => (
              <View
                key={vill.id}
                style={[
                  styles.villageCard,
                  {
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderColor: vill.urgencyIndex > 85 ? colors.dangerBorder : colors.warningBorder,
                  },
                ]}
              >
                <View style={styles.villageHeader}>
                  <View>
                    <Text style={[styles.villageName, { color: colors.textPrimary }]}>
                      {vill.villageName}
                    </Text>
                    <Text style={[styles.villageSub, { color: colors.textMuted }]}>
                      {vill.district} • {vill.state}
                    </Text>
                  </View>
                  <View style={[styles.urgencyBadge, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
                    <Text style={[styles.urgencyScore, { color: colors.danger }]}>
                      Urgency Score: {vill.urgencyIndex}/100
                    </Text>
                  </View>
                </View>

                <View style={styles.villageMetaGrid}>
                  <View style={styles.villageMetaCell}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Population</Text>
                    <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{vill.population.toLocaleString()}</Text>
                  </View>
                  <View style={styles.villageMetaCell}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Days Cut Off</Text>
                    <Text style={[styles.metaVal, { color: colors.danger }]}>{vill.daysIsolated} Days</Text>
                  </View>
                  <View style={styles.villageMetaCell}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Essential Stock</Text>
                    <Text style={[styles.metaVal, { color: colors.warning }]}>{vill.essentialStock}</Text>
                  </View>
                </View>

                <View style={[styles.blockageReasonBox, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
                  <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Blockage Cause:</Text> {vill.accessBlockageReason}
                  </Text>
                  <Text style={[styles.actionText, { color: colors.steelBlue }]}>
                    <Text style={{ fontWeight: '700' }}>AI Action:</Text> {vill.recommendedAirDropOrBypass}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.dispatchBtn, { backgroundColor: colors.steelBlue }]}
                  onPress={() => handleTriggerIVR('1078', vill.villageName)}
                  activeOpacity={0.8}
                >
                  <PhoneCall size={14} color="#ffffff" />
                  <Text style={styles.dispatchBtnText}>
                    Dispatch Air Drop & Multi-Channel Alert
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* DASHBOARD 4: Multi-Channel Alert & IVR Dispatch Center */}
      {activeTab === 'alerts' && (
        <View style={styles.sectionPadding}>
          <Text style={[styles.sectionTitleHeader, { color: colors.textPrimary }]}>
            Multi-Channel Alert & IVR Voice Call Gateway
          </Text>
          <Text style={[styles.sectionSubHeader, { color: colors.textSecondary }]}>
            Enables low-literacy users and low-connectivity mountain zones to receive voice calls & SMS alerts
          </Text>

          {ivrFeedback && (
            <View style={[styles.ivrFeedbackBox, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <Text style={[styles.ivrFeedbackText, { color: colors.success }]}>{ivrFeedback}</Text>
            </View>
          )}

          <View style={[styles.alertChannelCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: colors.border }]}>
            <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>Supported Alert Channels</Text>
            
            <View style={styles.channelRow}>
              <View style={[styles.channelIcon, { backgroundColor: colors.steelBlue + '20' }]}>
                <PhoneCall size={18} color={colors.steelBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.channelName, { color: colors.textPrimary }]}>1. IVR Automated Regional Voice Call (Exotel/Twilio)</Text>
                <Text style={[styles.channelDesc, { color: colors.textMuted }]}>
                  Spoken alerts in Assamese, Khasi, Garo, Mizo, Manipuri for low-literacy field users.
                </Text>
              </View>
            </View>

            <View style={styles.channelRow}>
              <View style={[styles.channelIcon, { backgroundColor: colors.warning + '20' }]}>
                <Radio size={18} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.channelName, { color: colors.textPrimary }]}>2. Offline SMS Gateway (Fast2SMS / GSM Failover)</Text>
                <Text style={[styles.channelDesc, { color: colors.textMuted }]}>
                  Transmits GPS coordinates and detour instructions to emergency contacts via SMS.
                </Text>
              </View>
            </View>

            <View style={styles.channelRow}>
              <View style={[styles.channelIcon, { backgroundColor: colors.success + '20' }]}>
                <Zap size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.channelName, { color: colors.textPrimary }]}>3. High-Priority App Push Notification</Text>
                <Text style={[styles.channelDesc, { color: colors.textMuted }]}>
                  Instant alert override with synthesized web audio alarm siren.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.testAlertBtn, { backgroundColor: colors.steelBlue }]}
              onPress={() => handleTriggerIVR('+91-9876543210', 'NER Transport Control')}
              activeOpacity={0.8}
            >
              <Radio size={16} color="#ffffff" />
              <Text style={styles.testAlertBtnText}>Test Multi-Channel IVR Voice Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  header: {
    padding: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  tabScroll: {
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  sectionPadding: {
    padding: 14,
  },
  demoBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  demoBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  demoBannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  demoBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  searchBarRow: {
    marginBottom: 12,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 12,
  },
  convoyListScroll: {
    maxHeight: 400,
  },
  convoyCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  convoyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cargoIcon: {
    fontSize: 22,
  },
  cargoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  vehicleNo: {
    fontSize: 10.5,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  routeDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 6,
  },
  routeCol: {
    flex: 1,
    minWidth: 140,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  routeVal: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10.5,
  },
  bypassAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  bypassAlertText: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  corridorSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  corridorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  corridorChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  disasterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  disasterToggleText: {
    fontSize: 11,
    fontWeight: '900',
  },
  aiSummaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  corridorTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '900',
  },
  terrainText: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitleHeader: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  sectionSubHeader: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 15,
  },
  candidateCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  candidateTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  riskTag: {
    fontSize: 11,
    fontWeight: '900',
  },
  nodePathBox: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    marginBottom: 6,
  },
  nodePathText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  candMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  candMetaText: {
    fontSize: 10.5,
  },
  candDesc: {
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  villageCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  villageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  villageName: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  villageSub: {
    fontSize: 10.5,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  urgencyScore: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  villageMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  villageMetaCell: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
  },
  metaVal: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 1,
  },
  blockageReasonBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    gap: 4,
  },
  reasonText: {
    fontSize: 11,
  },
  actionText: {
    fontSize: 11,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  dispatchBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  alertChannelCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    fontSize: 12,
    fontWeight: '800',
  },
  channelDesc: {
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 15,
  },
  testAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  testAlertBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  ivrFeedbackBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  ivrFeedbackText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  routeMapContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  routeMapHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeMapHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  routeMapHeaderSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  mobileMapFallback: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  googleMapsBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
