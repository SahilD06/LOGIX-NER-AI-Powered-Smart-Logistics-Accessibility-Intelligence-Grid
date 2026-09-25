// Simulated Mock Data for North-East Region (NER) Landslide Early Warning System

export interface SensorData {
  id: string;
  name: string;
  location: [number, number]; // [lat, lon]
  state: string;
  type: 'soil_moisture' | 'inclinometer' | 'rain_gauge' | 'water_level' | 'extensometer';
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  battery: number;
  lastUpdated: string;
}

export interface RiskZone {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  radius: number; // in meters
  populationAffected: number;
  slopeAngle: number;
}

export interface LandslideIncident {
  id: string;
  title: string;
  location: [number, number];
  state: string;
  date: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  casualties: number;
  status: 'Active' | 'Resolved' | 'Clearing';
}

export interface ConnectivityRoute {
  id: string;
  route: string;
  name: string;
  state: string;
  status: 'Blocked' | 'Vulnerable' | 'Clear';
  reason: string;
  alternateRoute?: string;
  clearanceEta?: string;
}

export interface EmergencyShelter {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  contact: string;
  suppliesStatus: 'Adequate' | 'Limited' | 'Critical';
}

export const MOCK_SENSORS: SensorData[] = [
  {
    id: 'S-01',
    name: 'Shillong Peak Incline Probe',
    location: [25.5788, 91.8933],
    state: 'Meghalaya',
    type: 'soil_moisture',
    value: 88,
    unit: '%',
    threshold: 80,
    status: 'critical',
    battery: 94,
    lastUpdated: '2 mins ago',
  },
  {
    id: 'S-02',
    name: 'Gangtok Slope Inclinometer',
    location: [27.3314, 88.6138],
    state: 'Sikkim',
    type: 'inclinometer',
    value: 2.3,
    unit: 'deg/hr',
    threshold: 2.0,
    status: 'critical',
    battery: 89,
    lastUpdated: '5 mins ago',
  },
  {
    id: 'S-03',
    name: 'Guwahati Hills Rain Station',
    location: [26.1445, 91.7362],
    state: 'Assam',
    type: 'rain_gauge',
    value: 124,
    unit: 'mm/24h',
    threshold: 100,
    status: 'critical',
    battery: 96,
    lastUpdated: '1 min ago',
  },
  {
    id: 'S-04',
    name: 'Dibrugarh Brahmaputra Gauge',
    location: [27.4728, 94.9120],
    state: 'Assam',
    type: 'water_level',
    value: 104.8,
    unit: 'm MSL',
    threshold: 105.0,
    status: 'warning',
    battery: 82,
    lastUpdated: '8 mins ago',
  },
  {
    id: 'S-05',
    name: 'Aizawl Fault Extensometer',
    location: [23.7271, 92.7176],
    state: 'Mizoram',
    type: 'extensometer',
    value: 0.9,
    unit: 'mm displacement',
    threshold: 1.0,
    status: 'warning',
    battery: 91,
    lastUpdated: '12 mins ago',
  },
  {
    id: 'S-06',
    name: 'Kohima Bypass Slip Monitor',
    location: [25.6751, 94.1086],
    state: 'Nagaland',
    type: 'inclinometer',
    value: 0.6,
    unit: 'deg/hr',
    threshold: 1.8,
    status: 'normal',
    battery: 87,
    lastUpdated: '15 mins ago',
  },
  {
    id: 'S-07',
    name: 'Itanagar Papum Pare Station',
    location: [27.0844, 93.6053],
    state: 'Arunachal Pradesh',
    type: 'soil_moisture',
    value: 62,
    unit: '%',
    threshold: 75,
    status: 'normal',
    battery: 95,
    lastUpdated: '20 mins ago',
  },
];

export const MOCK_RISK_ZONES: RiskZone[] = [
  {
    id: 'Z-01',
    name: 'East Khasi Hills (Cherrapunji-Mawsynram belt)',
    state: 'Meghalaya',
    center: [25.5788, 91.8933],
    riskLevel: 'critical',
    radius: 18000,
    populationAffected: 45000,
    slopeAngle: 42,
  },
  {
    id: 'Z-02',
    name: 'Tawang Valley Highland Corridor',
    state: 'Arunachal Pradesh',
    center: [27.5860, 91.8594],
    riskLevel: 'high',
    radius: 15000,
    populationAffected: 22000,
    slopeAngle: 48,
  },
  {
    id: 'Z-03',
    name: 'Dima Hasao Hill District',
    state: 'Assam',
    center: [25.1764, 93.0232],
    riskLevel: 'high',
    radius: 22000,
    populationAffected: 38000,
    slopeAngle: 36,
  },
  {
    id: 'Z-04',
    name: 'South Sikkim Slope Corridor',
    state: 'Sikkim',
    center: [27.2000, 88.4000],
    riskLevel: 'medium',
    radius: 12000,
    populationAffected: 15000,
    slopeAngle: 39,
  },
];

export const HISTORICAL_LANDSLIDES: LandslideIncident[] = [
  {
    id: 'L-01',
    title: 'Sonapur Tunnel Debris Avalanche',
    location: [25.1200, 92.3600],
    state: 'Meghalaya',
    date: '2024-06-18',
    severity: 'Critical',
    impact: 'NH-6 cut off for 72 hours, heavy cargo stranded',
    casualties: 0,
    status: 'Resolved',
  },
  {
    id: 'L-02',
    title: 'Gangtok - Singtam Highway Slip',
    location: [27.3314, 88.6138],
    state: 'Sikkim',
    date: '2024-05-10',
    severity: 'High',
    impact: 'Vehicular movement disrupted on NH-10',
    casualties: 0,
    status: 'Resolved',
  },
  {
    id: 'L-03',
    title: 'Haflong Railway Track Subsidence',
    location: [25.1764, 93.0232],
    state: 'Assam',
    date: '2024-07-02',
    severity: 'Critical',
    impact: 'Broad-gauge rail connectivity severed',
    casualties: 0,
    status: 'Active',
  },
];

export const CONNECTIVITY_STATUS: ConnectivityRoute[] = [
  {
    id: 'R-01',
    route: 'NH-6',
    name: 'Shillong — Silchar Highway',
    state: 'Meghalaya / Assam',
    status: 'Blocked',
    reason: 'Active mudslide at Sonapur stretch. Clearance in progress.',
    alternateRoute: 'Via Umkiang bypass (light vehicles only)',
    clearanceEta: '4 Hours',
  },
  {
    id: 'R-02',
    route: 'NH-10',
    name: 'Siliguri — Gangtok Lifeline',
    state: 'West Bengal / Sikkim',
    status: 'Vulnerable',
    reason: 'Heavy seepage near 29th Mile, single-lane restricted flow.',
    alternateRoute: 'Via Lava - Algarah - Reshi route',
    clearanceEta: 'Open with Caution',
  },
  {
    id: 'R-03',
    route: 'NH-29',
    name: 'Dimapur — Kohima Express Corridor',
    state: 'Nagaland',
    status: 'Clear',
    reason: 'Normal movement. Hill slopes stabilized with netting.',
    clearanceEta: 'Clear',
  },
  {
    id: 'R-04',
    route: 'NH-13',
    name: 'Trans-Arunachal Highway (Potin - Banderdewa)',
    state: 'Arunachal Pradesh',
    status: 'Vulnerable',
    reason: 'Intermittent rockfalls near Karsingsa.',
    clearanceEta: 'Monitored',
  },
];

export const EMERGENCY_SHELTERS: EmergencyShelter[] = [
  {
    id: 'SH-01',
    name: 'JN Stadium Indoor Relief Camp',
    locationName: 'Polo Grounds, Shillong',
    coordinates: [25.5830, 91.8890],
    capacity: 1200,
    currentOccupancy: 340,
    contact: '+91 364 2224000',
    suppliesStatus: 'Adequate',
  },
  {
    id: 'SH-02',
    name: 'Paljor Stadium Relief Center',
    locationName: 'Gangtok Central',
    coordinates: [27.3290, 88.6120],
    capacity: 800,
    currentOccupancy: 190,
    contact: '+91 3592 202111',
    suppliesStatus: 'Adequate',
  },
  {
    id: 'SH-03',
    name: 'Haflong Government College Camp',
    locationName: 'Dima Hasao, Assam',
    coordinates: [25.1680, 93.0150],
    capacity: 650,
    currentOccupancy: 420,
    contact: '+91 3673 236222',
    suppliesStatus: 'Limited',
  },
];

export interface EmergencyContact {
  title: string;
  number: string;
  type: string;
  category: 'State Control Room' | 'Toll-Free Hotline';
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  // Toll-Free Emergency Hotlines
  {
    title: 'All-in-One National Emergency',
    number: '112',
    type: 'Unified Police, Medical & Rescue',
    category: 'Toll-Free Hotline',
  },
  {
    title: 'National Disaster Response Force (NDRF)',
    number: '1078',
    type: '24x7 Landslide Rescue & Evacuation',
    category: 'Toll-Free Hotline',
  },
  {
    title: 'State Emergency Operation Centres (SEOC)',
    number: '1070 / 1079',
    type: 'State-Level Emergency Operations',
    category: 'Toll-Free Hotline',
  },
  {
    title: 'Regional Relief & Rescue (District Control)',
    number: '1077',
    type: 'Direct Specific District Control Room',
    category: 'Toll-Free Hotline',
  },

  // State Disaster Management Control Rooms
  {
    title: 'Assam State Control Room (ASDMA)',
    number: '0361-2237219 / 09401044617',
    type: 'Regional Operations, Rescue & Camps',
    category: 'State Control Room',
  },
  {
    title: 'Meghalaya State Control Room (SDMA)',
    number: '0364-2502098 / 6009924512',
    type: 'Regional Operations & Rescue Coordinates',
    category: 'State Control Room',
  },
  {
    title: 'Arunachal Pradesh Helpline (SDMA)',
    number: '8787336331',
    type: 'Regional Operations & Localized Camps',
    category: 'State Control Room',
  },
];

export interface EarlyWarningAlert {
  id: string;
  level: 'RED' | 'ORANGE' | 'YELLOW';
  levelText: string;
  timeAgo: string;
  title: string;
  body: string;
  authority: string;
  officialUrl: string;
  smsPayload: string;
}

export const EARLY_WARNING_ALERTS: EarlyWarningAlert[] = [
  {
    id: 'ALERT-RED-01',
    level: 'RED',
    levelText: 'RED ALERT - LEVEL 4',
    timeAgo: 'Issued 35 mins ago',
    title: 'East Khasi & South Garo Hills Flash Warning',
    body: 'Precipitation threshold exceeded (140mm / 24h). Critical instability detected in Sohra and Mawsynram slope cuts. Evacuation from unstable downhill settlements strongly advised.',
    authority: 'Issued by India Meteorological Dept (IMD) & Meghalaya SDMA',
    officialUrl: 'https://mausam.imd.gov.in',
    smsPayload: '🚨 CRITICAL LANDSLIDE RED ALERT: Heavy precipitation (140mm/24h) in East Khasi & Garo Hills. Evacuate downhill slopes immediately! Helplines: NDRF 1078, SDMA 1070.',
  },
  {
    id: 'ALERT-ORG-02',
    level: 'ORANGE',
    levelText: 'ORANGE WARNING - LEVEL 3',
    timeAgo: 'Issued 2 hours ago',
    title: 'Sikkim Highway NH-10 Mudflow Precaution',
    body: 'Continuous seepage on 29th Mile and Teesta Valley roads. Heavy goods traffic restricted between 19:00 - 06:00. Use Lava - Algarah bypass if traveling.',
    authority: 'Border Roads Organisation (BRO Task Force 144) Official Advisory',
    officialUrl: 'https://bro.gov.in',
    smsPayload: '⚠️ LANDSLIDE ORANGE WARNING: Sikkim NH-10 (29th Mile) mudflow active. Heavy traffic restricted 19:00-06:00. Use Lava-Algarah bypass. Helpline: 112.',
  },
  {
    id: 'ALERT-YEL-03',
    level: 'YELLOW',
    levelText: 'YELLOW WATCH - LEVEL 2',
    timeAgo: 'Issued 5 hours ago',
    title: 'Dima Hasao Railway Section Surveillance',
    body: 'Inclinometer ground sensors showing 0.4mm slow creep. Engineering teams deployed for slope anchoring.',
    authority: 'Northeast Frontier Railway (NFR) Disaster Control',
    officialUrl: 'https://nfr.indianrailways.gov.in',
    smsPayload: 'ℹ️ LANDSLIDE WATCH: Dima Hasao railway section under slope surveillance. Engineering teams deployed. Stay tuned to RAKSHAK NER alerts.',
  },
];

