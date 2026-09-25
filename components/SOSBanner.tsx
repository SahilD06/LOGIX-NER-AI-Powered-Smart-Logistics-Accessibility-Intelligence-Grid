import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { AlertCircle, ShieldCheck, Siren, PhoneForwarded, Radio } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { playEmergencySiren, stopEmergencySiren } from '../services/audioAlertService';
import { broadcastSOSLocationToEmergencyContacts } from '../services/emergencyContactsService';

interface SOSBannerProps {
  sosStatus: 'none' | 'needs_help' | 'safe';
  onTriggerSOS: () => void;
  onMarkSafe: () => void;
  onSimulateDanger?: () => void;
  isSimulatedDanger?: boolean;
}

export const SOSBanner: React.FC<SOSBannerProps> = ({
  sosStatus,
  onTriggerSOS,
  onMarkSafe,
  onSimulateDanger,
  isSimulatedDanger = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const { currentRole } = useAuth();
  const [broadcastSent, setBroadcastSent] = useState(false);

  const isTester = currentRole === 'tester';

  const handleSOSPress = () => {
    onTriggerSOS();
    setBroadcastSent(true);
    // 1. Play high-priority siren & vibration override
    playEmergencySiren(4000);
    // 2. Automatically broadcast live location SMS to saved family & friends
    broadcastSOSLocationToEmergencyContacts(25.5788, 91.8933, 'East Khasi Hills • Shillong Sector');
  };

  const handleSafePress = () => {
    onMarkSafe();
    setBroadcastSent(false);
    stopEmergencySiren();
  };

  return (
    <View style={styles.container}>
      {/* SOS State Active Alert */}
      {sosStatus === 'needs_help' && (
        <View style={[styles.activeSOSCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <View style={styles.activeSOSHeader}>
            <View style={[styles.pulseRedCircle, { backgroundColor: colors.danger }]}>
              <Siren size={24} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeSOSTitle, { color: colors.danger }]}>EMERGENCY SOS BROADCAST ACTIVE</Text>
              <Text style={[styles.activeSOSSubtitle, { color: colors.textSecondary }]}>
                GPS Beacon transmitting (Lat: 25.5788, Lon: 91.8933) to NDRF & State Control.
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[styles.safeButton, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}
              onPress={handleSafePress}
              activeOpacity={0.8}
            >
              <ShieldCheck size={18} color={colors.success} />
              <Text style={[styles.safeButtonText, { color: colors.success }]}>I am Safe Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callControlBtn, { backgroundColor: colors.danger }]}
              onPress={() => {
                const smsText = encodeURIComponent('🚨 EMERGENCY LANDSLIDE SOS! GPS: 25.5788N, 91.8933E (East Khasi Hills). Immediate NDRF rescue team requested!');
                if (Platform.OS === 'web') {
                  window.open(`sms:1078?body=${smsText}`, '_self');
                } else {
                  Linking.openURL(`sms:1078?body=${smsText}`);
                }
              }}
              activeOpacity={0.8}
            >
              <PhoneForwarded size={16} color="#ffffff" />
              <Text style={styles.callControlText}>SMS SOS (1078) 📱</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Safe Confirmation Card */}
      {sosStatus === 'safe' && (
        <View style={[styles.safeCard, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
          <ShieldCheck size={22} color={colors.success} />
          <Text style={[styles.safeCardText, { color: colors.success }]}>Status Confirmed: Marked as SAFE with Response Hub.</Text>
          <TouchableOpacity onPress={() => onMarkSafe()} style={[styles.dismissBtn, { backgroundColor: isDark ? '#2C4A3C' : '#D9E9DF' }]}>
            <Text style={[styles.dismissText, { color: colors.success }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Normal Trigger Buttons - Enlarged */}
      {sosStatus === 'none' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.sosButton, { backgroundColor: colors.danger }]}
            onPress={handleSOSPress}
            activeOpacity={0.85}
          >
            <AlertCircle size={22} color="#ffffff" />
            <Text style={styles.sosButtonText}>SOS EMERGENCY</Text>
          </TouchableOpacity>

          {/* Simulate Risk is only visible to QA Tester */}
          {isTester && onSimulateDanger && (
            <TouchableOpacity
              style={[
                styles.simDangerBtn,
                { backgroundColor: colors.cardBg, borderColor: colors.border },
                isSimulatedDanger && { backgroundColor: colors.dangerBg, borderColor: colors.danger },
              ]}
              onPress={onSimulateDanger}
              activeOpacity={0.8}
            >
              <Radio size={18} color={isSimulatedDanger ? colors.danger : colors.textSecondary} />
              <Text style={[styles.simDangerText, { color: isSimulatedDanger ? colors.danger : colors.textSecondary }]}>
                {isSimulatedDanger ? 'Danger Mode ON' : 'Simulate Risk'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sosButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#B84A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  simDangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  simDangerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeSOSCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
  },
  activeSOSHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  pulseRedCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSOSTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeSOSSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  safeButton: {
    flex: 1,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  safeButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  callControlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callControlText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  safeCard: {
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  safeCardText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
