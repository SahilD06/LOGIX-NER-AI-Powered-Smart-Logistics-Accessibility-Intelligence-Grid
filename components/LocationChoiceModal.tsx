import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LocationPrecisionMode } from '../services/locationService';
import { Crosshair, MapPin, Mountain, ShieldCheck, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

interface LocationChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: LocationPrecisionMode) => void;
  currentMode?: LocationPrecisionMode;
}

export const LocationChoiceModal: React.FC<LocationChoiceModalProps> = ({
  visible,
  onClose,
  onSelectMode,
  currentMode = 'precise',
}) => {
  const { colors, isDark } = useAppTheme();

  const handleSelect = (mode: LocationPrecisionMode) => {
    onSelectMode(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Crosshair size={22} color={colors.steelBlue} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Location Access Choice
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.subPanel }]}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            How would you like GeoShield AI to access your location for landslide alerts & SOS emergency broadcasts?
          </Text>

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {/* Option 1: Precise GPS */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.subPanel, borderColor: currentMode === 'precise' ? colors.steelBlue : colors.border },
                currentMode === 'precise' && { borderWidth: 2 },
              ]}
              onPress={() => handleSelect('precise')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.successBg }]}>
                <Crosshair size={20} color={colors.success} />
              </View>
              <View style={styles.optionContent}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Precise GPS Location</Text>
                  <View style={[styles.recommendedBadge, { backgroundColor: colors.steelBlue + '20' }]}>
                    <Text style={[styles.recommendedText, { color: colors.steelBlue }]}>Recommended</Text>
                  </View>
                </View>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Exact GPS coordinates for automatic live SOS broadcast to emergency contacts & pinpoint hill warnings.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Approximate District */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.subPanel, borderColor: currentMode === 'approximate' ? colors.steelBlue : colors.border },
                currentMode === 'approximate' && { borderWidth: 2 },
              ]}
              onPress={() => handleSelect('approximate')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.warningBg }]}>
                <MapPin size={20} color={colors.warning} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Approximate District Location</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  District-level area data (~1–2 km privacy blur) for general slope warnings without precise pin location.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Default Safe Pass */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.subPanel, borderColor: currentMode === 'default' ? colors.steelBlue : colors.border },
                currentMode === 'default' && { borderWidth: 2 },
              ]}
              onPress={() => handleSelect('default')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.subPanel }]}>
                <Mountain size={20} color={colors.steelBlue} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Default Safe Pass (No GPS)</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Uses East Khasi Hills • Shillong Sector regional telemetry without querying device location sensors.
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer note */}
          <View style={[styles.footerNote, { backgroundColor: colors.subPanel, borderColor: colors.borderSoft }]}>
            <ShieldCheck size={14} color={colors.steelBlue} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Your choice is stored locally and can be changed anytime by tapping the location header.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionsList: {
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
});
