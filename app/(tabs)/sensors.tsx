import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { MOCK_SENSORS, CONNECTIVITY_STATUS } from '../../services/mockData';
import {
  Activity,
  Navigation,
  Battery,
  Clock,
} from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SensorsScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useLanguage();
  const [activeSegment, setActiveSegment] = useState<'sensors' | 'highways'>('sensors');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('all');

  const sensorTypes = [
    { key: 'all', label: t.allLayers },
    { key: 'soil_moisture', label: t.soilMoisture },
    { key: 'inclinometer', label: t.tiltAngle },
    { key: 'rain_gauge', label: t.rainfallGauge },
    { key: 'water_level', label: t.porePressure },
    { key: 'extensometer', label: t.liveStatus },
  ];

  const filteredSensors =
    selectedSensorType === 'all'
      ? MOCK_SENSORS
      : MOCK_SENSORS.filter((s) => s.type === selectedSensorType);

  return (
    <View style={StyleSheet.flatten([styles.container, { backgroundColor: colors.bg }])}>
      <Header />

      <View style={[styles.segmentContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'sensors' && { backgroundColor: colors.steelBlue }]}
          onPress={() => setActiveSegment('sensors')}
        >
          <Activity size={16} color={activeSegment === 'sensors' ? '#ffffff' : colors.textSecondary} />
          <Text style={[styles.segmentText, { color: activeSegment === 'sensors' ? '#ffffff' : colors.textSecondary }]}>
            {t.sensorsTitle} ({MOCK_SENSORS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'highways' && { backgroundColor: colors.steelBlue }]}
          onPress={() => setActiveSegment('highways')}
        >
          <Navigation size={16} color={activeSegment === 'highways' ? '#ffffff' : colors.textSecondary} />
          <Text style={[styles.segmentText, { color: activeSegment === 'highways' ? '#ffffff' : colors.textSecondary }]}>
            {t.highwayCorridors} ({CONNECTIVITY_STATUS.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeSegment === 'sensors' && (
          <View>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {sensorTypes.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                    selectedSensorType === t.key && { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue },
                  ]}
                  onPress={() => setSelectedSensorType(t.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedSensorType === t.key ? '#ffffff' : colors.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sensors Grid - Enlarged */}
            <View style={styles.cardsList}>
              {filteredSensors.map((sensor) => {
                const isCritical = sensor.status === 'critical';
                const isWarning = sensor.status === 'warning';
                return (
                  <View key={sensor.id} style={[styles.sensorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                      <View style={styles.sensorIconRow}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: isCritical ? colors.danger : isWarning ? colors.warning : colors.success },
                          ]}
                        />
                        <Text style={[styles.sensorId, { color: colors.steelBlue }]}>{sensor.id}</Text>
                        <Text style={[styles.sensorStateTag, { color: colors.textMuted }]}>{sensor.state}</Text>
                      </View>

                      <View style={styles.batteryRow}>
                        <Battery size={14} color={colors.textSecondary} />
                        <Text style={[styles.batteryText, { color: colors.textSecondary }]}>{sensor.battery}%</Text>
                      </View>
                    </View>

                    <Text style={[styles.sensorName, { color: colors.textPrimary }]}>{sensor.name}</Text>

                    <View style={[styles.telemetryBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                      <View style={styles.telemetryValCol}>
                        <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Live Reading</Text>
                        <Text
                          style={[
                            styles.telemetryValue,
                            { color: isCritical ? colors.danger : isWarning ? colors.warning : colors.steelBlue },
                          ]}
                        >
                          {sensor.value} <Text style={[styles.unitText, { color: colors.textSecondary }]}>{sensor.unit}</Text>
                        </Text>
                      </View>

                      <View style={styles.telemetryThreshCol}>
                        <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Alert Threshold</Text>
                        <Text style={[styles.threshValue, { color: colors.textSecondary }]}>
                          {sensor.threshold} {sensor.unit}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.footerLeft}>
                        <Clock size={13} color={colors.textMuted} />
                        <Text style={[styles.footerTime, { color: colors.textMuted }]}>{sensor.lastUpdated}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isCritical
                              ? colors.dangerBg
                              : isWarning
                              ? colors.warningBg
                              : colors.successBg,
                            borderColor: isCritical
                              ? colors.dangerBorder
                              : isWarning
                              ? colors.warningBorder
                              : colors.successBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: isCritical ? colors.danger : isWarning ? colors.warning : colors.success },
                          ]}
                        >
                          {sensor.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeSegment === 'highways' && (
          <View style={styles.cardsList}>
            {CONNECTIVITY_STATUS.map((item) => (
              <View key={item.id} style={[styles.highwayCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.highwayHeader}>
                  <View>
                    <Text style={[styles.highwayRoute, { color: colors.textPrimary }]}>{item.route}</Text>
                    <Text style={[styles.highwayName, { color: colors.textSecondary }]}>{item.name}</Text>
                    <Text style={[styles.highwayState, { color: colors.textMuted }]}>{item.state}</Text>
                  </View>

                  <View
                    style={[
                      styles.highwayBadge,
                      {
                        backgroundColor:
                          item.status === 'Blocked'
                            ? colors.dangerBg
                            : item.status === 'Vulnerable'
                            ? colors.warningBg
                            : colors.successBg,
                        borderColor:
                          item.status === 'Blocked'
                            ? colors.dangerBorder
                            : item.status === 'Vulnerable'
                            ? colors.warningBorder
                            : colors.successBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.highwayBadgeText,
                        {
                          color:
                            item.status === 'Blocked'
                              ? colors.danger
                              : item.status === 'Vulnerable'
                              ? colors.warning
                              : colors.success,
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.reasonBox, { backgroundColor: colors.subPanel, borderColor: colors.border }]}>
                  <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
                    <Text style={{ fontWeight: '800' }}>Situation: </Text>
                    {item.reason}
                  </Text>
                </View>

                {item.alternateRoute && (
                  <Text style={[styles.altRouteText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '800', color: colors.steelBlue }}>Detour: </Text>
                    {item.alternateRoute}
                  </Text>
                )}

                <View style={[styles.highwayFooter, { borderTopColor: colors.borderSoft }]}>
                  <Text style={[styles.etaText, { color: colors.textSecondary }]}>
                    Clearance ETA: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{item.clearanceEta}</Text>
                  </Text>
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
  segmentContainer: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    maxWidth: 960,
    alignSelf: 'center',
    width: '93%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardsList: {
    gap: 14,
  },
  sensorCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sensorIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensorId: {
    fontSize: 12,
    fontWeight: '900',
  },
  sensorStateTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sensorName: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  telemetryBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  telemetryValCol: {
    flex: 1,
  },
  telemetryThreshCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  telemetryValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  threshValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTime: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  highwayCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  highwayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  highwayRoute: {
    fontSize: 16,
    fontWeight: '900',
  },
  highwayName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  highwayState: {
    fontSize: 11,
    marginTop: 2,
  },
  highwayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  highwayBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  reasonBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 17,
  },
  altRouteText: {
    fontSize: 12,
    marginBottom: 8,
  },
  highwayFooter: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  etaText: {
    fontSize: 11,
  },
});
