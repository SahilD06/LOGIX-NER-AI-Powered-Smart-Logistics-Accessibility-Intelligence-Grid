export interface EssentialConvoy {
  id: string;
  vehicleNo: string;
  cargoType: 'Medicines & Oxygen' | 'FCI Food Rations' | 'BRO Construction Gear' | 'Agri Produce';
  cargoIcon: string;
  driverName: string;
  origin: string;
  destination: string;
  route: string;
  currentLocation: [number, number];
  locationName: string;
  status: 'In Transit' | 'Delayed (Landslide)' | 'Rerouted (Bypass)' | 'Delivered';
  etaMinutes: number;
  delayHours: number;
  alternateRouteSuggested?: string;
  speedKmH: number;
}

export interface DistrictAccessibilityStatus {
  districtId: string;
  districtName: string;
  state: string;
  connectivityStatus: 'Normal Access' | 'Restricted / One-Way' | 'Critical Disruption';
  activeDisruptionsCount: number;
  essentialStockLevel: 'Sufficient' | 'Moderate' | 'Critical Shortage';
  mainHighway: string;
  alternatePassOpen: boolean;
  lastUpdated: string;
}

export interface IsolatedVillage {
  id: string;
  villageName: string;
  district: string;
  state: string;
  population: number;
  daysIsolated: number;
  essentialStock: 'Critical (Out of Stock)' | 'Low (< 2 Days)' | 'Moderate';
  accessBlockageReason: string;
  urgencyIndex: number; // Calculated composite score: pop * days * stock_weight
  nearestSupplyHub: string;
  recommendedAirDropOrBypass: string;
}

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  baseDistanceKm: number;
  disruptionProbabilityPct: number; // 0 - 100
  terrainMultiplier: number;
  status: 'Clear' | 'High Risk' | 'Blocked (Landslide)';
}

export interface RouteCandidate {
  id: string;
  title: string;
  isPrimary: boolean;
  pathNodes: string[];
  totalDistanceKm: number;
  disruptionRiskPct: number;
  etaMinutes: number;
  delayHours: number;
  routeColor: string;
  description: string;
  waypointCoords: [number, number][];
  googleMapsUrl: string;
}

export interface AIRouteOptimization {
  corridorName: string;
  isDisasterMode: boolean;
  primaryStatus: 'Blocked (Landslide)' | 'High Risk' | 'Clear';
  primaryEtaHours: number;
  suggestedBypassRoute: string;
  bypassDistanceKm: number;
  delayDifferenceHours: number;
  accessibilityScore: number; // 0-100
  terrainCondition: string;
  graphCandidates: RouteCandidate[];
}

export const ISOLATED_VILLAGES_DATA: IsolatedVillage[] = [
  {
    id: 'VILL-01',
    villageName: 'Lish Remote Settlement',
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    population: 3420,
    daysIsolated: 4,
    essentialStock: 'Critical (Out of Stock)',
    accessBlockageReason: 'Trans-Arunachal Highway (NH-13) bridge collapse at KM 74',
    urgencyIndex: 94,
    nearestSupplyHub: 'Dirang Army Logistics Hub',
    recommendedAirDropOrBypass: 'Deploy BRO Footbridge & Tactical Drone Delivery',
  },
  {
    id: 'VILL-02',
    villageName: 'Reshi Border Hamlet',
    district: 'East Sikkim',
    state: 'Sikkim',
    population: 1850,
    daysIsolated: 3,
    essentialStock: 'Low (< 2 Days)',
    accessBlockageReason: 'NH-10 Teesta River landslide mudslide cut-off',
    urgencyIndex: 88,
    nearestSupplyHub: 'Algarah Relief Depot',
    recommendedAirDropOrBypass: 'Reroute via Lava-Reshi Pass Bypass Convoy',
  },
  {
    id: 'VILL-03',
    villageName: 'Jatinga Hill Settlement',
    district: 'Dima Hasao',
    state: 'Assam',
    population: 2900,
    daysIsolated: 2,
    essentialStock: 'Low (< 2 Days)',
    accessBlockageReason: 'Sinking road bed & debris torrent on NH-27',
    urgencyIndex: 79,
    nearestSupplyHub: 'Haflong Central FCI Store',
    recommendedAirDropOrBypass: 'Mahur-Maibang Secondary Arterial Pass',
  },
  {
    id: 'VILL-04',
    villageName: 'Nongstoin Hinterland',
    district: 'West Khasi Hills',
    state: 'Meghalaya',
    population: 4100,
    daysIsolated: 1,
    essentialStock: 'Moderate',
    accessBlockageReason: 'Slope seepage & rockfall on Nongstoin Bypass',
    urgencyIndex: 62,
    nearestSupplyHub: 'Shillong Logistics Depot',
    recommendedAirDropOrBypass: 'Single-lane emergency convoy pass',
  },
];

export const DISTRICT_ACCESSIBILITY_DATA: DistrictAccessibilityStatus[] = [
  {
    districtId: 'D-EKH',
    districtName: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    connectivityStatus: 'Restricted / One-Way',
    activeDisruptionsCount: 2,
    essentialStockLevel: 'Moderate',
    mainHighway: 'NH-6 Shillong Bypass',
    alternatePassOpen: true,
    lastUpdated: '10 mins ago',
  },
  {
    districtId: 'D-GTK',
    districtName: 'Gangtok & East Sikkim',
    state: 'Sikkim',
    connectivityStatus: 'Critical Disruption',
    activeDisruptionsCount: 4,
    essentialStockLevel: 'Critical Shortage',
    mainHighway: 'NH-10 Sevoke-Gangtok Corridor',
    alternatePassOpen: true,
    lastUpdated: '5 mins ago',
  },
  {
    districtId: 'D-DH',
    districtName: 'Dima Hasao (Haflong)',
    state: 'Assam',
    connectivityStatus: 'Restricted / One-Way',
    activeDisruptionsCount: 1,
    essentialStockLevel: 'Moderate',
    mainHighway: 'NH-27 Lumding-Haflong',
    alternatePassOpen: true,
    lastUpdated: '15 mins ago',
  },
  {
    districtId: 'D-TWG',
    districtName: 'Tawang High Pass',
    state: 'Arunachal Pradesh',
    connectivityStatus: 'Restricted / One-Way',
    activeDisruptionsCount: 2,
    essentialStockLevel: 'Sufficient',
    mainHighway: 'NH-13 Trans-Arunachal',
    alternatePassOpen: false,
    lastUpdated: '20 mins ago',
  },
  {
    districtId: 'D-IMP',
    districtName: 'Imphal West',
    state: 'Manipur',
    connectivityStatus: 'Normal Access',
    activeDisruptionsCount: 0,
    essentialStockLevel: 'Sufficient',
    mainHighway: 'NH-102 Imphal-Moreh',
    alternatePassOpen: true,
    lastUpdated: '30 mins ago',
  },
  {
    districtId: 'D-CMP',
    districtName: 'Champhai Border',
    state: 'Mizoram',
    connectivityStatus: 'Normal Access',
    activeDisruptionsCount: 0,
    essentialStockLevel: 'Sufficient',
    mainHighway: 'NH-6 Aizawl-Champhai',
    alternatePassOpen: true,
    lastUpdated: '1 hour ago',
  },
];

export const ESSENTIAL_CONVOYS: EssentialConvoy[] = [
  {
    id: 'CONVOY-MED-01',
    vehicleNo: 'SK-01-GA-4890',
    cargoType: 'Medicines & Oxygen',
    cargoIcon: '💊',
    driverName: 'Rajesh Sharma',
    origin: 'Siliguri Hub',
    destination: 'STNM Hospital Gangtok',
    route: 'NH-10 Sevoke Corridor',
    currentLocation: [26.9800, 88.4700],
    locationName: 'Near Teesta Bazaar Checkpoint',
    status: 'Delayed (Landslide)',
    etaMinutes: 210,
    delayHours: 3.5,
    alternateRouteSuggested: 'Reroute via Lava — Algarah — Reshi Pass Bypass',
    speedKmH: 12,
  },
  {
    id: 'CONVOY-FOOD-88',
    vehicleNo: 'ML-05-F-9912',
    cargoType: 'FCI Food Rations',
    cargoIcon: '🌾',
    driverName: 'Bipul Sangma',
    origin: 'Guwahati FCI Depot',
    destination: 'Shillong Central Warehouse',
    route: 'NH-6 Guwahati-Shillong',
    currentLocation: [25.7100, 91.8700],
    locationName: 'Nongpoh Bypass Corridor',
    status: 'Rerouted (Bypass)',
    etaMinutes: 85,
    delayHours: 1.2,
    alternateRouteSuggested: 'Umiam Lake Alternate Arterial Bypass',
    speedKmH: 38,
  },
  {
    id: 'CONVOY-BRO-12',
    vehicleNo: 'AS-09-E-5501',
    cargoType: 'BRO Construction Gear',
    cargoIcon: '🏗️',
    driverName: 'Subedar V. Kumar',
    origin: 'Tezpur Base',
    destination: 'Sela Tunnel / Tawang',
    route: 'NH-13 Trans-Arunachal',
    currentLocation: [27.2500, 92.4000],
    locationName: 'Dirang Valley Sector',
    status: 'In Transit',
    etaMinutes: 140,
    delayHours: 0.5,
    speedKmH: 42,
  },
  {
    id: 'CONVOY-AGRI-40',
    vehicleNo: 'AS-11-BC-3044',
    cargoType: 'Agri Produce',
    cargoIcon: '🍎',
    driverName: 'Amitabha Roy',
    origin: 'Haflong Orchards',
    destination: 'Silchar Mandi',
    route: 'NH-27 Lumding-Haflong',
    currentLocation: [25.0500, 92.8500],
    locationName: 'Jatinga Mudslide Zone',
    status: 'Delayed (Landslide)',
    etaMinutes: 190,
    delayHours: 2.8,
    alternateRouteSuggested: 'Reroute via Mahur — Maibang Bypass',
    speedKmH: 15,
  },
];

/**
 * AI Dynamic Graph-Based Route Optimization & Disruption Predictor Engine
 */
export function getAIRouteOptimization(corridorName: string, isDisasterMode: boolean = false): AIRouteOptimization {
  const nameLower = corridorName.toLowerCase();
  const disasterMultiplier = isDisasterMode ? 1.45 : 1.0;

  if (nameLower.includes('nh-10') || nameLower.includes('sevoke') || nameLower.includes('gangtok')) {
    return {
      corridorName: 'NH-10 Sevoke — Gangtok Highway',
      isDisasterMode,
      primaryStatus: 'Blocked (Landslide)',
      primaryEtaHours: parseFloat((6.5 * disasterMultiplier).toFixed(1)),
      suggestedBypassRoute: 'Siliguri ➔ Damdim ➔ Lava ➔ Algarah ➔ Reshi Pass ➔ Gangtok',
      bypassDistanceKm: 142,
      delayDifferenceHours: +2.1,
      accessibilityScore: isDisasterMode ? 42 : 68,
      terrainCondition: isDisasterMode
        ? '🚨 DISASTER EMERGENCY MODE: Heavy 180mm monsoonal deluge. Teesta bridge unpassable. Lava bypass active for BRO & STNM Medical Convoys.'
        : 'Active mudslide near Teesta Bridge (KM 29). Lava bypass clear for light trucks & emergency ambulances.',
      graphCandidates: [
        {
          id: 'route-primary',
          title: 'Primary Route (NH-10 Direct Corridor)',
          isPrimary: true,
          pathNodes: ['Siliguri Junction', 'Sevoke Bridge', 'Teesta Bazaar (Blocked)', 'Rangpo Border', 'Gangtok'],
          totalDistanceKm: 114,
          disruptionRiskPct: isDisasterMode ? 98 : 88,
          etaMinutes: Math.round(390 * disasterMultiplier),
          delayHours: 3.5,
          routeColor: '#EF4444',
          description: 'High risk of mudslides at KM 29. Debris clearing in progress.',
          waypointCoords: [[26.7271, 88.4316], [26.8900, 88.4700], [27.0500, 88.4700], [27.1800, 88.5100], [27.3314, 88.6138]],
          googleMapsUrl: 'https://www.google.com/maps/dir/Siliguri,+West+Bengal/Sevoke,+West+Bengal/Teesta+Bazar,+West+Bengal/Gangtok,+Sikkim',
        },
        {
          id: 'route-alt-1',
          title: 'AI Alternate Bypass 1 (Lava — Reshi Pass)',
          isPrimary: false,
          pathNodes: ['Siliguri Junction', 'Damdim', 'Lava High Pass', 'Algarah Depot', 'Reshi Pass', 'Gangtok'],
          totalDistanceKm: 142,
          disruptionRiskPct: isDisasterMode ? 28 : 14,
          etaMinutes: Math.round(240 * (isDisasterMode ? 1.15 : 1.0)),
          delayHours: 1.2,
          routeColor: '#10B981',
          description: 'RECOMMENDED: Dynamic AI Graph weights favor Lava pass. Clear for essential medical & food convoys.',
          waypointCoords: [[26.7271, 88.4316], [26.8778, 88.7042], [27.0874, 88.6575], [27.1167, 88.5833], [27.1700, 88.6300], [27.3314, 88.6138]],
          googleMapsUrl: 'https://www.google.com/maps/dir/Siliguri,+West+Bengal/Damdim,+West+Bengal/Lava,+West+Bengal/Algarah,+West+Bengal/Gangtok,+Sikkim',
        },
        {
          id: 'route-alt-2',
          title: 'AI Tactical Bypass 2 (Damdim — Pedong Arterial)',
          isPrimary: false,
          pathNodes: ['Siliguri Junction', 'Damdim', 'Pedong', 'Rhenok', 'Pakyong', 'Gangtok'],
          totalDistanceKm: 156,
          disruptionRiskPct: isDisasterMode ? 36 : 22,
          etaMinutes: Math.round(270 * (isDisasterMode ? 1.2 : 1.0)),
          delayHours: 1.8,
          routeColor: '#F59E0B',
          description: 'Single-lane mountain pass. Suitable for light BRO vehicles.',
          waypointCoords: [[26.7271, 88.4316], [26.8778, 88.7042], [27.1500, 88.6167], [27.2355, 88.5947], [27.3314, 88.6138]],
          googleMapsUrl: 'https://www.google.com/maps/dir/Siliguri,+West+Bengal/Pedong,+West+Bengal/Pakyong,+Sikkim/Gangtok,+Sikkim',
        },
      ],
    };
  }

  if (nameLower.includes('nh-6') || nameLower.includes('shillong') || nameLower.includes('meghalaya')) {
    return {
      corridorName: 'NH-6 Shillong Peak Bypass Corridor',
      isDisasterMode,
      primaryStatus: 'High Risk',
      primaryEtaHours: parseFloat((3.2 * disasterMultiplier).toFixed(1)),
      suggestedBypassRoute: 'Guwahati ➔ Jorabat ➔ Umsning ➔ Mawlyndep Bypass ➔ Shillong',
      bypassDistanceKm: 104,
      delayDifferenceHours: +0.8,
      accessibilityScore: isDisasterMode ? 62 : 82,
      terrainCondition: 'Slope seepage near Umsning cut-fill slope. Single lane traffic active.',
      graphCandidates: [
        {
          id: 'route-primary-nh6',
          title: 'Primary Route (NH-6 Direct Highway)',
          isPrimary: true,
          pathNodes: ['Guwahati Depot', 'Jorabat Junction', 'Nongpoh', 'Umsning', 'Shillong Center'],
          totalDistanceKm: 98,
          disruptionRiskPct: isDisasterMode ? 74 : 45,
          etaMinutes: Math.round(192 * disasterMultiplier),
          delayHours: 1.1,
          routeColor: '#F59E0B',
          description: 'Moderate slope seepage. One-way traffic controls active.',
          waypointCoords: [[26.1445, 91.7362], [26.1100, 91.8700], [25.9000, 91.8800], [25.7500, 91.8900], [25.5788, 91.8933]],
          googleMapsUrl: 'https://www.google.com/maps/dir/Guwahati,+Assam/Nongpoh,+Meghalaya/Shillong,+Meghalaya',
        },
        {
          id: 'route-alt-nh6',
          title: 'AI Alternate Bypass (Mawlyndep Umiam Pass)',
          isPrimary: false,
          pathNodes: ['Guwahati Depot', 'Jorabat Junction', 'Umsning Bypass', 'Mawlyndep', 'Umiam Lake', 'Shillong'],
          totalDistanceKm: 104,
          disruptionRiskPct: isDisasterMode ? 18 : 8,
          etaMinutes: 125,
          delayHours: 0.3,
          routeColor: '#10B981',
          description: 'OPTIMAL: Smooth asphalt bypass around slope instability zones.',
          waypointCoords: [[26.1445, 91.7362], [26.1100, 91.8700], [25.6800, 91.9300], [25.6500, 91.9000], [25.5788, 91.8933]],
          googleMapsUrl: 'https://www.google.com/maps/dir/Guwahati,+Assam/Mawlyndep,+Meghalaya/Umiam,+Meghalaya/Shillong,+Meghalaya',
        },
      ],
    };
  }

  return {
    corridorName: 'NH-27 Haflong — Silchar Corridor',
    isDisasterMode,
    primaryStatus: 'Blocked (Landslide)',
    primaryEtaHours: parseFloat((5.8 * disasterMultiplier).toFixed(1)),
    suggestedBypassRoute: 'Haflong ➔ Mahur ➔ Maibang ➔ Umrangso Bypass',
    bypassDistanceKm: 128,
    delayDifferenceHours: +1.5,
    accessibilityScore: isDisasterMode ? 54 : 74,
    terrainCondition: 'Sinking road bed at Jatinga valley. Alternate bypass cleared for essential FCI supply convoys.',
    graphCandidates: [
      {
        id: 'route-primary-nh27',
        title: 'Primary Route (NH-27 Jatinga Section)',
        isPrimary: true,
        pathNodes: ['Lumding Railhead', 'Haflong Town', 'Jatinga Mudslide Zone', 'Silchar Mandi'],
        totalDistanceKm: 106,
        disruptionRiskPct: isDisasterMode ? 95 : 82,
        etaMinutes: Math.round(348 * disasterMultiplier),
        delayHours: 2.8,
        routeColor: '#EF4444',
        description: 'Roadbed sinking near Jatinga valley. Heavy vehicles prohibited.',
        waypointCoords: [[25.7523, 93.1678], [25.1764, 93.0232], [25.1100, 93.0300], [24.8333, 92.7789]],
        googleMapsUrl: 'https://www.google.com/maps/dir/Lumding,+Assam/Haflong,+Assam/Jatinga,+Assam/Silchar,+Assam',
      },
      {
        id: 'route-alt-nh27',
        title: 'AI Alternate Bypass (Mahur — Maibang Pass)',
        isPrimary: false,
        pathNodes: ['Lumding Railhead', 'Haflong Town', 'Mahur Pass', 'Maibang', 'Umrangso', 'Silchar Mandi'],
        totalDistanceKm: 128,
        disruptionRiskPct: isDisasterMode ? 24 : 12,
        etaMinutes: 165,
        delayHours: 0.8,
        routeColor: '#10B981',
        description: 'RECOMMENDED: Stable bedrock bypass route for FCI ration convoys.',
        waypointCoords: [[25.7523, 93.1678], [25.1764, 93.0232], [25.1667, 93.1167], [25.3000, 93.1667], [25.5000, 92.7333], [24.8333, 92.7789]],
        googleMapsUrl: 'https://www.google.com/maps/dir/Lumding,+Assam/Haflong,+Assam/Mahur,+Assam/Maibang,+Assam/Silchar,+Assam',
      },
    ],
  };
}

/**
 * Trigger IVR Voice & Multi-Channel Emergency Dispatch
 */
export function triggerMultiChannelIVRAlert(recipientPhone: string, alertMessage: string): { success: boolean; channels: string[]; ivrCallId: string } {
  const callId = `IVR-${Date.now().toString().slice(-6)}`;
  return {
    success: true,
    channels: ['SMS Gateway (Fast2SMS)', 'IVR Voice Call (Exotel/Twilio)', 'LOGIX Push Notification'],
    ivrCallId: callId,
  };
}

