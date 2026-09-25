import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MOCK_SENSORS, MOCK_RISK_ZONES, HISTORICAL_LANDSLIDES } from '../services/mockData';
import { ESSENTIAL_CONVOYS } from '../services/logisticsService';
import { NasaEvent } from '../services/api';
import { MapPin, AlertTriangle, Activity, Satellite, Layers, ZoomIn, ZoomOut, Compass, Truck } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface InteractiveMapProps {
  nasaEvents?: NasaEvent[];
  simulatedDanger?: boolean;
  onSelectLocation?: (lat: number, lon: number, name: string) => void;
}

type FilterType = 'all' | 'convoys' | 'sensors' | 'zones' | 'history' | 'nasa' | 'corridors';
type BasemapType = 'topo' | 'satellite';

const BASEMAP_URLS = {
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// Spatial Bounding Box: Restrict strictly to North-East & Northern Mountain Corridors (India)
const NER_SPATIAL_BOUNDS: [[number, number], [number, number]] = [
  [20.5, 87.0], // SW Corner (North East Region)
  [30.5, 98.0], // NE Corner
];

const HIGHWAY_CORRIDORS = [
  {
    name: 'NH-10 Sevoke — Gangtok Highway',
    coords: [
      [26.8900, 88.4700],
      [27.0500, 88.4700],
      [27.1800, 88.5100],
      [27.3314, 88.6138],
    ],
    status: 'Vulnerable (Active Watch)',
    color: '#EA580C',
  },
  {
    name: 'NH-6 Shillong Peak Bypass Corridor',
    coords: [
      [25.5788, 91.8933],
      [25.5100, 91.8300],
      [25.4200, 91.7500],
    ],
    status: 'High Risk (Mudslide Alert)',
    color: '#DC2626',
  },
  {
    name: 'NH-58 Badrinath Mountain Corridor',
    coords: [
      [30.1300, 78.3000],
      [30.5400, 79.4800],
      [30.7400, 79.4900],
    ],
    status: 'Monitored Corridor',
    color: '#0284C7',
  },
];

const REGIONS = [
  { name: 'NER Overview', center: [26.1445, 91.7362] as [number, number], zoom: 7 },
  { name: 'Shillong (Meghalaya)', center: [25.5788, 91.8933] as [number, number], zoom: 11 },
  { name: 'Gangtok (Sikkim)', center: [27.3314, 88.6138] as [number, number], zoom: 11 },
  { name: 'Tawang (Arunachal)', center: [27.5860, 91.8594] as [number, number], zoom: 10 },
  { name: 'Dima Hasao (Assam)', center: [25.1764, 93.0232] as [number, number], zoom: 10 },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nasaEvents = [],
  simulatedDanger = false,
  onSelectLocation,
}) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [basemap, setBasemap] = useState<BasemapType>('topo');
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const mapContainerId = useRef(`leaflet-map-${Math.random().toString(36).substring(2, 9)}`).current;
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Auto-pan map to Teesta Bazaar simulation zone when simulation is triggered
  useEffect(() => {
    if (simulatedDanger && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([27.0800, 88.5200], 10, { duration: 1.5 });
    }
  }, [simulatedDanger]);

  // Load Leaflet CSS & Script dynamically if on web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      const win = window as any;
      if (win.L) {
        setIsLeafletReady(true);
        return;
      }

      const existingScript = document.getElementById('leaflet-js-cdn');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLeafletReady(true));
        return;
      }

      const script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (Platform.OS !== 'web' || !isLeafletReady) return;

    const win = window as any;
    const L = win.L;
    if (!L) return;

    const container = document.getElementById(mapContainerId);
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with spatial bounding box restricted strictly to NER & Northern Corridors
    const map = L.map(mapContainerId, {
      center: [26.1445, 91.7362],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: NER_SPATIAL_BOUNDS,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: false,
    });

    const tileUrl = BASEMAP_URLS[basemap];
    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    renderMapFeatures(map, layerGroupRef.current, activeFilter);

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady, mapContainerId]);

  // Handle Basemap Switch
  useEffect(() => {
    if (!mapInstanceRef.current || Platform.OS !== 'web') return;
    const win = window as any;
    const L = win.L;
    if (!L) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl = BASEMAP_URLS[basemap];
    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c'],
    }).addTo(mapInstanceRef.current);
  }, [basemap]);

  // Handle Filter Change & Simulation Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || Platform.OS !== 'web') return;
    renderMapFeatures(mapInstanceRef.current, layerGroupRef.current, activeFilter);
  }, [activeFilter, nasaEvents, simulatedDanger]);

  const renderMapFeatures = (map: any, layerGroup: any, filter: FilterType) => {
    const win = window as any;
    const L = win.L;
    if (!L || !layerGroup) return;

    layerGroup.clearLayers();

    const makeIcon = (
      bgColor: string,
      innerSymbol: string,
      label: string = '',
      size: number = 38
    ) => {
      const isLarge = size >= 36;
      const fontSize = isLarge ? 17 : 14;
      return L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.45));
          ">
            <div style="
              background: ${bgColor};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2.5px solid #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              <span style="
                transform: rotate(45deg);
                font-size: ${fontSize}px;
                line-height: 1;
                display: block;
              ">${innerSymbol}</span>
            </div>
            ${
              label
                ? `<div style="
                    background: #0F172A;
                    color: #FFFFFF;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-top: 3px;
                    white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.4);
                    letter-spacing: 0.3px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.4);
                  ">${label}</div>`
                : ''
            }
          </div>
        `,
        iconSize: [size, size + 16],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // 0. Render Live Simulation Disruption & Dynamic Reroute Layers
    if (simulatedDanger) {
      // 0a. Pulsing Landslide Collapse Marker at Teesta Bazaar (NH-10)
      const collapseIcon = makeIcon('#DC2626', '💥', 'TEESTA COLLAPSE (NH-10)', 44);
      const collapseMarker = L.marker([27.0500, 88.4700], { icon: collapseIcon });
      collapseMarker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; color: #DC2626;">
          <div style="font-size: 11px; font-weight: 800;">🚨 LIVE COLLAPSE SIMULATION ACTIVE</div>
          <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">Teesta Bazaar Landslide Blockage</div>
          <div style="font-size: 11px; color: #5E5653; margin-top: 4px;">
            <b>Status:</b> NH-10 Completely Blocked (40m Debris Cut)<br/>
            <b>AI Protocol:</b> Medical Oxygen Convoy Rerouted via Lava Pass
          </div>
        </div>
      `);
      layerGroup.addLayer(collapseMarker);

      // 0b. Pulsing Red Danger Zone Circle
      const dangerCircle = L.circle([27.0500, 88.4700], {
        radius: 4500,
        color: '#DC2626',
        fillColor: '#DC2626',
        fillOpacity: 0.35,
        weight: 3,
        dashArray: '6, 6',
      });
      layerGroup.addLayer(dangerCircle);

      // 0c. Active Emerald Green Bypass Polyline (Lava — Reshi Pass)
      const bypassPolyline = L.polyline([
        [26.8900, 88.4700], // Sevoke
        [27.0800, 88.5800], // Lava Pass
        [27.1800, 88.5100], // Reshi
        [27.3314, 88.6138], // Gangtok
      ], {
        color: '#059669',
        weight: 6,
        opacity: 0.95,
      });
      bypassPolyline.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; color: #059669;">
          <div style="font-size: 11px; font-weight: 800;">🟢 ACTIVE AI BYPASS ROUTE</div>
          <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">Lava — Reshi Pass Arterial Detour</div>
          <div style="font-size: 11px; color: #5E5653; margin-top: 4px;">Status: Clear & Open for Essential Freight</div>
        </div>
      `);
      layerGroup.addLayer(bypassPolyline);
    }

    // 1. Render Risk Zones
    if (filter === 'all' || filter === 'zones') {
      MOCK_RISK_ZONES.forEach((zone) => {
        const isCritical = zone.riskLevel === 'critical';
        const color = isCritical ? '#DC2626' : zone.riskLevel === 'high' ? '#D97706' : '#2563EB';

        const circle = L.circle(zone.center, {
          radius: zone.radius,
          color: color,
          fillColor: color,
          fillOpacity: isCritical ? 0.28 : 0.18,
          weight: 2.5,
          dashArray: '6, 6',
        });

        circle.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="color: ${color}; font-size: 11px; font-weight: 800; text-transform: uppercase;">
              ${zone.riskLevel} SUSCEPTIBILITY ZONE
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 3px; color: #2C2827;">${zone.name}</div>
            <div style="font-size: 11px; color: #5E5653; margin-top: 2px;">State: ${zone.state}</div>
            <div style="margin-top: 8px; border-top: 1px solid #DCD7D8; padding-top: 6px; font-size: 12px; color: #5E5653; line-height: 1.4;">
              <div>• Slope Angle: <b>${zone.slopeAngle}°</b></div>
              <div>• At-Risk Population: <b>${(zone.populationAffected / 1000).toFixed(0)}k residents</b></div>
            </div>
          </div>
        `);

        layerGroup.addLayer(circle);
      });
    }

    // 2. Render IoT Slope Sensors
    if (filter === 'all' || filter === 'sensors') {
      MOCK_SENSORS.forEach((sensor) => {
        const isAlert = sensor.status === 'critical';
        const isWarn = sensor.status === 'warning';
        const bgColor = isAlert ? '#DC2626' : isWarn ? '#D97706' : '#059669';
        const shortName = sensor.id || 'SENSOR';
        const icon = makeIcon(bgColor, '⚡', shortName, 36);

        const marker = L.marker(sensor.location, { icon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 800; color: #6B7C98;">${sensor.id}</span>
              <span style="background: ${isAlert ? '#F8ECEC' : '#EEF5F1'}; color: ${isAlert ? '#DC2626' : '#059669'}; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 6px; border: 1px solid ${isAlert ? '#FCA5A5' : '#6EE7B7'};">
                ${sensor.status.toUpperCase()}
              </span>
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #2C2827;">${sensor.name}</div>
            <div style="font-size: 11px; color: #5E5653; text-transform: capitalize;">${sensor.state} • ${sensor.type.replace('_', ' ')}</div>
            <div style="margin-top: 8px; background: #FAF9F9; padding: 10px; border-radius: 8px; border: 1px solid #DCD7D8;">
              <div style="font-size: 11px; color: #5E5653;">Live Telemetry:</div>
              <div style="font-size: 17px; font-weight: 900; color: ${bgColor};">
                ${sensor.value} <span style="font-size: 11px; color: #7B7F8A;">${sensor.unit}</span>
              </div>
              <div style="font-size: 10px; color: #7B7F8A; margin-top: 2px;">Threshold: ${sensor.threshold} ${sensor.unit}</div>
            </div>
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 3. Render Historical Landslides
    if (filter === 'all' || filter === 'history') {
      HISTORICAL_LANDSLIDES.forEach((ls) => {
        const icon = makeIcon('#DC2626', '⚠️', 'BLOCKAGE', 36);
        const marker = L.marker(ls.location, { icon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="font-size: 11px; font-weight: 800; color: #DC2626;">HIGHWAY BLOCKAGE / LANDSLIDE</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 2px; color: #2C2827;">${ls.title}</div>
            <div style="font-size: 11px; color: #5E5653;">Recorded: ${ls.date} (${ls.state})</div>
            <div style="margin-top: 8px; font-size: 12px; color: #5E5653; line-height: 1.4;">
              <b>Impact:</b> ${ls.impact}
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 4. Render NASA EONET alerts
    if (filter === 'all' || filter === 'nasa') {
      nasaEvents.forEach((ev) => {
        const icon = makeIcon('#7C3AED', '📡', 'NASA SATELLITE', 36);
        const marker = L.marker(ev.coordinates, { icon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="font-size: 11px; font-weight: 800; color: #7C3AED;">NASA SATELLITE ALERT</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 2px; color: #2C2827;">${ev.title}</div>
            <div style="font-size: 11px; color: #5E5653;">Category: ${ev.category}</div>
            <div style="margin-top: 6px; font-size: 12px; color: #5E5653;">
              Monitored by NASA Earth Observing System (EOS).
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 5. Render Mountain Highway Corridors (NH-10, NH-58, NH-6)
    if (filter === 'all' || filter === 'corridors') {
      HIGHWAY_CORRIDORS.forEach((corridor) => {
        const isNh10Blocked = simulatedDanger && corridor.name.includes('NH-10');
        const polyline = L.polyline(corridor.coords, {
          color: isNh10Blocked ? '#DC2626' : corridor.color,
          weight: isNh10Blocked ? 5 : 4,
          opacity: 0.85,
          dashArray: isNh10Blocked ? '4, 6' : '8, 8',
        });
        polyline.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="font-size: 11px; font-weight: 800; color: ${isNh10Blocked ? '#DC2626' : corridor.color};">HIGHWAY CORRIDOR</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">${corridor.name}</div>
            <div style="font-size: 11px; margin-top: 4px; color: #5E5653;">Status: <b>${isNh10Blocked ? 'CRITICAL (LANDSLIDE BLOCKED)' : corridor.status}</b></div>
          </div>
        `);
        layerGroup.addLayer(polyline);
      });
    }

    // 6. Render Essential Goods Convoys GPS Tracking
    if (filter === 'all' || filter === 'convoys') {
      ESSENTIAL_CONVOYS.forEach((convoy) => {
        const isMedRerouted = simulatedDanger && convoy.id === 'CONVOY-MED-01';
        const location = isMedRerouted ? [27.0800, 88.5800] as [number, number] : convoy.currentLocation;
        const convoyLabel = isMedRerouted ? 'REROUTED LAVA' : convoy.cargoType.split(' ')[0].toUpperCase();
        const iconColor = isMedRerouted ? '#059669' : '#2563EB';
        const icon = makeIcon(iconColor, convoy.cargoIcon, convoyLabel, 40);

        const marker = L.marker(location, { icon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif; color: #2C2827;">
            <div style="font-size: 11px; font-weight: 800; color: ${iconColor};">
              ${isMedRerouted ? '🟢 REROUTED ESSENTIAL CONVOY' : 'ESSENTIAL SUPPLY CONVOY'}
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">${convoy.cargoIcon} ${convoy.cargoType}</div>
            <div style="font-size: 11px; color: #5E5653;">Vehicle: ${convoy.vehicleNo} (${convoy.driverName})</div>
            <div style="margin-top: 6px; font-size: 12px; color: #2C2827;">
              <b>Route:</b> ${isMedRerouted ? 'Lava — Reshi Pass Bypass' : `${convoy.origin} ➔ ${convoy.destination}`}<br/>
              <b>Status:</b> ${isMedRerouted ? 'Rerouted past Teesta Landslide' : convoy.status}
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }
  };

  const flyToRegion = (center: [number, number], zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header & Filter Bar - Enlarged */}
      <View style={[styles.mapHeader, { borderBottomColor: colors.border, backgroundColor: colors.subPanel }]}>
        <View style={styles.titleRow}>
          <Layers size={18} color={colors.steelBlue} />
          <Text style={[styles.mapTitle, { color: colors.textPrimary }]}>{t.spatialGisRadar}</Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>({t.liveTerrainSatellite})</Text>

          {/* Basemap Toggle Buttons */}
          <View style={[styles.basemapToggleRow, { backgroundColor: colors.borderSoft, borderColor: colors.border }]}>
            {(['topo', 'satellite'] as BasemapType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.basemapBtn, basemap === type && { backgroundColor: colors.steelBlue }]}
                onPress={() => setBasemap(type)}
              >
                <Text style={[styles.basemapBtnText, { color: basemap === type ? '#ffffff' : colors.textSecondary }]}>
                  {type === 'topo' ? t.topoBasemap : t.satelliteBasemap}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Layer Filter Chips - Active/Inactive Toggle States */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'all'
                ? { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }
                : { backgroundColor: colors.subPanel, borderColor: colors.border },
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, { color: activeFilter === 'all' ? '#ffffff' : colors.textPrimary }]}>
              {t.allLayers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'convoys'
                ? { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }
                : { backgroundColor: colors.subPanel, borderColor: colors.border },
            ]}
            onPress={() => setActiveFilter('convoys')}
            activeOpacity={0.8}
          >
            <Truck size={13} color={activeFilter === 'convoys' ? '#ffffff' : colors.steelBlue} />
            <Text style={[styles.filterChipText, { color: activeFilter === 'convoys' ? '#ffffff' : colors.textPrimary }]}>
              {t.supplyVehicles} ({ESSENTIAL_CONVOYS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'corridors'
                ? { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }
                : { backgroundColor: colors.subPanel, borderColor: colors.border },
            ]}
            onPress={() => setActiveFilter('corridors')}
            activeOpacity={0.8}
          >
            <MapPin size={13} color={activeFilter === 'corridors' ? '#ffffff' : colors.warning} />
            <Text style={[styles.filterChipText, { color: activeFilter === 'corridors' ? '#ffffff' : colors.textPrimary }]}>
              {t.highwayCorridors} (3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'zones'
                ? { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }
                : { backgroundColor: colors.subPanel, borderColor: colors.border },
            ]}
            onPress={() => setActiveFilter('zones')}
            activeOpacity={0.8}
          >
            <AlertTriangle size={13} color={activeFilter === 'zones' ? '#ffffff' : colors.danger} />
            <Text style={[styles.filterChipText, { color: activeFilter === 'zones' ? '#ffffff' : colors.textPrimary }]}>
              {t.vulnerableRoadZones}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Hero GIS Map Surface View — 520px Height */}
      <View style={[styles.mapCanvasWrapper, { backgroundColor: colors.bg }]}>
        {Platform.OS === 'web' ? (
          <div
            id={mapContainerId}
            style={{
              width: '100%',
              height: '520px',
              backgroundColor: colors.bg,
              zIndex: 1,
            }}
          />
        ) : (
          <View style={styles.mobileFallback}>
            <Text style={[styles.mobileFallbackText, { color: colors.textSecondary }]}>GIS Map View Active</Text>
          </View>
        )}

        {/* Floating Map Legend Overlay (Bottom-Left) */}
        <View
          style={[
            styles.mapLegendOverlay,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.legendTitle, { color: colors.textMuted }]}>{t.legendTitle}</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.steelBlue }]} />
            <Text style={[styles.legendItemText, { color: colors.textPrimary }]}>{t.legendConvoy}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.legendItemText, { color: colors.textPrimary }]}>{t.legendBlocked}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.legendItemText, { color: colors.textPrimary }]}>{t.legendHighRisk}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendItemText, { color: colors.textPrimary }]}>{t.legendClearPass}</Text>
          </View>
        </View>

        {/* Floating Zoom & Compass Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity style={[styles.controlIconBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={() => handleZoom(1)}>
            <ZoomIn size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlIconBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={() => handleZoom(-1)}>
            <ZoomOut size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlIconBtn, { backgroundColor: colors.steelBlue, borderColor: colors.steelBlue }]}
            onPress={() => flyToRegion([26.1445, 91.7362], 7)}
          >
            <Compass size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Regional Quick Jump Pills */}
        <View style={styles.regionJumpBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REGIONS.map((reg, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.regionJumpChip, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => flyToRegion(reg.center, reg.zoom)}
              >
                <MapPin size={12} color={colors.steelBlue} />
                <Text style={[styles.regionJumpText, { color: colors.textPrimary }]}>{reg.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  mapHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 10.5,
  },
  basemapToggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
    borderWidth: 1,
  },
  basemapBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  basemapBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    gap: 4,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mapCanvasWrapper: {
    position: 'relative',
    height: 520,
    overflow: 'hidden',
  },
  mobileFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFallbackText: {
    fontSize: 13,
  },
  mapLegendOverlay: {
    position: 'absolute',
    bottom: 54,
    left: 14,
    zIndex: 1000,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendItemText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  floatingControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    gap: 8,
  },
  controlIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  regionJumpBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  regionJumpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  regionJumpText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
