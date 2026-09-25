import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Header } from '../../components/Header';
import { EARLY_WARNING_ALERTS, EarlyWarningAlert } from '../../services/mockData';
import { playEmergencySiren } from '../../services/audioAlertService';
import {
  AlertOctagon,
  ShieldAlert,
  PhoneCall,
  Radio,
  Truck,
  Zap,
  MapPin,
  ExternalLink,
  Share2,
} from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';

export interface LogisticsControlRoom {
  id: string;
  agencyName: string;
  description: string;
  primaryPhone: string;
  secondaryPhone?: string;
  badge: 'National Command' | 'State Logistics Desk' | 'District Control';
  badgeColor: string;
}

const CONTROL_ROOMS: LogisticsControlRoom[] = [
  {
    id: 'CR-112',
    agencyName: 'Unified Emergency Command (National 112)',
    description: 'Centralized 24/7 disaster response & police/ambulance routing across all 8 NER states.',
    primaryPhone: '112',
    badge: 'National Command',
    badgeColor: '#EF4444',
  },
  {
    id: 'CR-1078',
    agencyName: 'NDRF Heavy Rescue & Convoy Evacuation (1078)',
    description: 'National Disaster Response Force heavy machinery dispatch & corridor clearing unit.',
    primaryPhone: '1078',
    badge: 'National Command',
    badgeColor: '#EF4444',
  },
  {
    id: 'CR-1077',
    agencyName: 'District Transport & BRO Command Desk (1077)',
    description: 'Border Roads Organisation (BRO) highway clearing & emergency bypass operations.',
    primaryPhone: '1077',
    badge: 'District Control',
    badgeColor: '#F59E0B',
  },
  {
    id: 'CR-ASDMA',
    agencyName: 'Assam State Control Room (ASDMA)',
    description: 'Regional logistics hub, FCI ration dispatch & flood relief camp coordinators.',
    primaryPhone: '0361-2237219',
    secondaryPhone: '09401044617',
    badge: 'State Logistics Desk',
    badgeColor: '#10B981',
  },
  {
    id: 'CR-SDMA-MEG',
    agencyName: 'Meghalaya State Logistics Hub (SDMA)',
    description: 'Shillong bypass monitoring, essential medical oxygen convoy tracking desk.',
    primaryPhone: '0364-2502098',
    secondaryPhone: '6009924512',
    badge: 'State Logistics Desk',
    badgeColor: '#10B981',
  },
  {
    id: 'CR-SDMA-AP',
    agencyName: 'Arunachal Pradesh High-Pass Control (SDMA)',
    description: 'Tawang Sela Tunnel logistics desk & mountain pass weather monitoring.',
    primaryPhone: '8787336331',
    badge: 'State Logistics Desk',
    badgeColor: '#10B981',
  },
];

export default function AlertsScreen() {
  const { colors, isDark } = useAppTheme();
  const [selectedTab, setSelectedTab] = useState<'disruptions' | 'control_desks'>('disruptions');

  const handleCall = (number: string) => {
    const cleanNum = number.replace(/[^0-9+]/g, '').trim();
    if (Platform.OS === 'web') {
      window.open(`tel:${cleanNum}`);
    } else {
      Linking.openURL(`tel:${cleanNum}`);
    }
  };

  const handleBroadcastSmsAlert = (alert: EarlyWarningAlert) => {
    playEmergencySiren(4000);
    const smsUrl = `sms:?body=${encodeURIComponent(alert.smsPayload)}`;
    if (Platform.OS === 'web') {
      window.open(smsUrl, '_self');
    } else {
      Linking.openURL(smsUrl);
    }
  };

  return (
    <View style={StyleSheet.flatten([styles.container, { backgroundColor: colors.bg }])}>
      <Header />

      {/* Main Tab Selector Bar */}
      <View style={[styles.tabSelectorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'disruptions' && { backgroundColor: colors.steelBlue },
          ]}
          onPress={() => setSelectedTab('disruptions')}
          activeOpacity={0.8}
        >
          <AlertOctagon size={15} color={selectedTab === 'disruptions' ? '#ffffff' : colors.textSecondary} />
          <Text style={[styles.tabButtonText, { color: selectedTab === 'disruptions' ? '#ffffff' : colors.textSecondary }]}>
            Corridor Disruption Advisories ({EARLY_WARNING_ALERTS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'control_desks' && { backgroundColor: colors.steelBlue },
          ]}
          onPress={() => setSelectedTab('control_desks')}
          activeOpacity={0.8}
        >
          <PhoneCall size={15} color={selectedTab === 'control_desks' ? '#ffffff' : colors.textSecondary} />
          <Text style={[styles.tabButtonText, { color: selectedTab === 'control_desks' ? '#ffffff' : colors.textSecondary }]}>
            Transport Control Command Desks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: Real-Time Road Disruption & Convoy Alerts */}
        {selectedTab === 'disruptions' && (
          <View>
            <Text style={[styles.sectionTitleHeader, { color: colors.textPrimary }]}>
              Corridor Disruption Advisories & Dynamic Detours
            </Text>
            <Text style={[styles.sectionSubHeader, { color: colors.textSecondary }]}>
              Real-time landslide advisories, slope collapse warnings, and dynamic route bypass instructions
            </Text>

            {EARLY_WARNING_ALERTS.map((alert) => {
              const isRed = alert.level === 'RED';
              return (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: isDark ? '#111827' : '#FFFFFF',
                      borderColor: isRed ? colors.dangerBorder : colors.warningBorder,
                      borderLeftWidth: 4,
                      borderLeftColor: isRed ? colors.danger : colors.warning,
                    },
                  ]}
                >
                  <View style={styles.alertHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.alertTitleRow}>
                        <Text style={[styles.locationName, { color: colors.textPrimary }]}>
                          {alert.title}
                        </Text>
                        <View
                          style={[
                            styles.severityPill,
                            {
                              backgroundColor: isRed ? colors.dangerBg : colors.warningBg,
                              borderColor: isRed ? colors.dangerBorder : colors.warningBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              { color: isRed ? colors.danger : colors.warning },
                            ]}
                          >
                            {alert.levelText}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.stateText, { color: colors.textMuted }]}>
                        {alert.timeAgo}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                    {alert.body}
                  </Text>

                  <View style={[styles.advisoryBox, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
                    <Text style={[styles.advisoryLabel, { color: colors.steelBlue }]}>
                      OFFICIAL DISPATCH ADVISORY:
                    </Text>
                    <Text style={[styles.advisoryText, { color: colors.textSecondary }]}>
                      {alert.authority}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.smsBtn, { backgroundColor: colors.steelBlue }]}
                    onPress={() => handleBroadcastSmsAlert(alert)}
                    activeOpacity={0.8}
                  >
                    <Radio size={14} color="#ffffff" />
                    <Text style={styles.smsBtnText}>
                      Broadcast SMS Alert to Active Convoys
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: Emergency Transport & Control Desks */}
        {selectedTab === 'control_desks' && (
          <View>
            <Text style={[styles.sectionTitleHeader, { color: colors.textPrimary }]}>
              Emergency Transport & Disaster Control Command Desks
            </Text>
            <Text style={[styles.sectionSubHeader, { color: colors.textSecondary }]}>
              1-Tap emergency hotlines for NDRF convoy rescue, BRO highway clearing & state logistics desks
            </Text>

            {CONTROL_ROOMS.map((room) => (
              <View
                key={room.id}
                style={[
                  styles.controlCard,
                  {
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: room.badgeColor,
                  },
                ]}
              >
                <View style={styles.controlHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.agencyTitle, { color: colors.textPrimary }]}>
                      {room.agencyName}
                    </Text>
                    <Text style={[styles.agencyDesc, { color: colors.textSecondary }]}>
                      {room.description}
                    </Text>
                  </View>
                  <View style={[styles.badgePill, { backgroundColor: room.badgeColor + '20', borderColor: room.badgeColor }]}>
                    <Text style={[styles.badgeText, { color: room.badgeColor }]}>
                      {room.badge}
                    </Text>
                  </View>
                </View>

                <View style={styles.phoneRow}>
                  <TouchableOpacity
                    style={[styles.phoneBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
                    onPress={() => handleCall(room.primaryPhone)}
                    activeOpacity={0.8}
                  >
                    <PhoneCall size={14} color={colors.danger} />
                    <Text style={[styles.phoneBtnText, { color: colors.danger }]}>
                      Call {room.primaryPhone}
                    </Text>
                  </TouchableOpacity>

                  {room.secondaryPhone && (
                    <TouchableOpacity
                      style={[styles.phoneBtn, { backgroundColor: colors.steelBlue + '20', borderColor: colors.steelBlue }]}
                      onPress={() => handleCall(room.secondaryPhone!)}
                      activeOpacity={0.8}
                    >
                      <PhoneCall size={14} color={colors.steelBlue} />
                      <Text style={[styles.phoneBtnText, { color: colors.steelBlue }]}>
                        Alt: {room.secondaryPhone}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitleHeader: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  sectionSubHeader: {
    fontSize: 11,
    marginBottom: 12,
  },
  alertCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '900',
  },
  stateText: {
    fontSize: 11,
    marginTop: 2,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  messageText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginVertical: 6,
  },
  advisoryBox: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    gap: 4,
  },
  advisoryLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  advisoryText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  smsBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  controlCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  agencyTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  agencyDesc: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  phoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  phoneBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
});
