/**
 * FloodMate MVP — Mock Seed Data
 * Real-world urban flood scenario (Bangkok Sukhumvit / Asoke / Rama IV drainage basin)
 */

export const INITIAL_LOCATIONS = [
  {
    id: "loc_home",
    name: "Home (Sukhumvit Soi 39)",
    category: "home",
    lat: 13.7385,
    lng: 100.5702,
    address: "Condo Tower A, Soi Phrom Phong",
    isPrimary: true
  },
  {
    id: "loc_work",
    name: "Office (Asoke Interchange)",
    category: "work",
    lat: 13.7371,
    lng: 100.5605,
    address: "22nd Fl, Asoke Business Center",
    isPrimary: false
  },
  {
    id: "loc_car",
    name: "Street Parked Car (Soi 23)",
    category: "car",
    lat: 13.7392,
    lng: 100.5641,
    address: "Open Street Lot, Sukhumvit 23",
    isPrimary: false
  }
];

export const INITIAL_FLOOD_POINTS = [
  {
    id: "sensor_asoke_01",
    name: "Asoke Montri - Sukhumvit 21",
    lat: 13.7398,
    lng: 100.5621,
    depthCm: 18,
    trend: "falling", // 'rising' | 'falling' | 'stable'
    trendRateCmHr: -3.5,
    confidence: 96,
    sourceType: "sensor", // 'sensor' | 'crowdsource' | 'rainfall_model'
    sensorId: "BKK-DRAIN-774",
    updatedAgo: "3 mins ago",
    rainfallIntensityMm: 42,
    surfaceWaterSpeed: "Moderate (0.6 m/s)",
    roadType: "Major Arterial Road",
    notes: "Drainage pump station #4 running at 100% capacity.",
    history: [
      { time: "18:00", depth: 10 },
      { time: "19:00", depth: 22 },
      { time: "20:00", depth: 26 },
      { time: "21:00", depth: 22 },
      { time: "21:30", depth: 20 },
      { time: "22:00", depth: 18 }
    ]
  },
  {
    id: "sensor_sukhumvit_39",
    name: "Sukhumvit Soi 39 (Soi Phrom Phong)",
    lat: 13.7368,
    lng: 100.5724,
    depthCm: 34,
    trend: "rising",
    trendRateCmHr: +5.2,
    confidence: 94,
    sourceType: "sensor",
    sensorId: "BKK-DRAIN-812",
    updatedAgo: "1 min ago",
    rainfallIntensityMm: 68,
    surfaceWaterSpeed: "Fast (1.2 m/s)",
    roadType: "Residential / Commercial Soi",
    notes: "Canal Saen Saep spillover alert active. Water backing up through street drains.",
    history: [
      { time: "18:00", depth: 8 },
      { time: "19:00", depth: 15 },
      { time: "20:00", depth: 24 },
      { time: "21:00", depth: 30 },
      { time: "21:30", depth: 32 },
      { time: "22:00", depth: 34 }
    ]
  },
  {
    id: "crowd_soi_23",
    name: "Sukhumvit Soi 23 Junction",
    lat: 13.7405,
    lng: 100.5652,
    depthCm: 27,
    trend: "rising",
    trendRateCmHr: +3.0,
    confidence: 88,
    sourceType: "crowdsource",
    reporterName: "FloodMate User @tanakorn",
    photoUrl: "assets/images/sample_flood_1.jpg",
    verifiedByAi: true,
    aiReferenceObject: "Toyota Camry Tire (Rim submerged)",
    updatedAgo: "7 mins ago",
    rainfallIntensityMm: 55,
    roadType: "Secondary Street",
    notes: "Sedans stalled near corner mini-mart. Motorcyclists dismounting.",
    history: [
      { time: "19:00", depth: 10 },
      { time: "20:00", depth: 18 },
      { time: "21:00", depth: 24 },
      { time: "22:00", depth: 27 }
    ]
  },
  {
    id: "sensor_rama4_canal",
    name: "Rama IV Road - Khlong Toei Junction",
    lat: 13.7225,
    lng: 100.5638,
    depthCm: 45,
    trend: "rising",
    trendRateCmHr: +7.0,
    confidence: 98,
    sourceType: "sensor",
    sensorId: "BKK-METRO-091",
    updatedAgo: "Just now",
    rainfallIntensityMm: 82,
    surfaceWaterSpeed: "Severe (1.8 m/s)",
    roadType: "Primary Highway Arterial",
    notes: "Left 2 lanes impassable to all civilian vehicles. Traffic police diverting to elevated tollway.",
    history: [
      { time: "18:00", depth: 12 },
      { time: "19:00", depth: 25 },
      { time: "20:00", depth: 36 },
      { time: "21:00", depth: 40 },
      { time: "21:30", depth: 42 },
      { time: "22:00", depth: 45 }
    ]
  },
  {
    id: "sensor_phrom_chit",
    name: "Phrom Chit Alley (Near Canal Bridge)",
    lat: 13.7445,
    lng: 100.5735,
    depthCm: 12,
    trend: "stable",
    trendRateCmHr: 0.0,
    confidence: 91,
    sourceType: "sensor",
    sensorId: "BKK-LOCAL-204",
    updatedAgo: "12 mins ago",
    rainfallIntensityMm: 30,
    surfaceWaterSpeed: "Slow (0.2 m/s)",
    roadType: "Alleyway",
    notes: "Temporary floodwall holding. Caution on sidewalk curb edges.",
    history: [
      { time: "18:00", depth: 10 },
      { time: "19:00", depth: 12 },
      { time: "20:00", depth: 13 },
      { time: "21:00", depth: 12 },
      { time: "22:00", depth: 12 }
    ]
  },
  {
    id: "crowd_benjakitti_gate",
    name: "Ratchadaphisek (Benjakitti Park North Gate)",
    lat: 13.7315,
    lng: 100.5592,
    depthCm: 8,
    trend: "falling",
    trendRateCmHr: -2.0,
    confidence: 85,
    sourceType: "crowdsource",
    reporterName: "Security Patrol #12",
    verifiedByAi: true,
    aiReferenceObject: "Street Curb (Top visible)",
    updatedAgo: "15 mins ago",
    rainfallIntensityMm: 22,
    roadType: "Park Perimeter Road",
    notes: "Normal drainage active, easily passable by all vehicle categories.",
    history: [
      { time: "19:00", depth: 15 },
      { time: "20:00", depth: 12 },
      { time: "21:00", depth: 10 },
      { time: "22:00", depth: 8 }
    ]
  }
];

export const INITIAL_ORG_FACILITIES = [
  {
    id: "org_fac_01",
    orgName: "Grand Sukhumvit Residence Juristic Office",
    facilityName: "Basement Parking Ramp B1-B2",
    currentWaterCm: 14,
    criticalThresholdCm: 25,
    status: "warning", // 'safe' | 'warning' | 'critical'
    pumpStatus: "2/3 Active (1 Backup Standing By)",
    barrierStatus: "Automated Barrier Deployed (50cm)",
    lastInspected: "10 mins ago",
    riskTrend: "Rising +2 cm/hr"
  },
  {
    id: "org_fac_02",
    orgName: "Grand Sukhumvit Residence Juristic Office",
    facilityName: "Main Entrance Driveway (Soi 39)",
    currentWaterCm: 32,
    criticalThresholdCm: 30,
    status: "critical",
    pumpStatus: "N/A (External Street)",
    barrierStatus: "Sandbag wall installed at property line",
    lastInspected: "4 mins ago",
    riskTrend: "Rising +4 cm/hr"
  },
  {
    id: "org_fac_03",
    orgName: "Grand Sukhumvit Residence Juristic Office",
    facilityName: "Electrical Transformer Vault (Ground Floor)",
    currentWaterCm: 0,
    criticalThresholdCm: 10,
    status: "safe",
    pumpStatus: "Sump pump dry",
    barrierStatus: "Sealed watertight door",
    lastInspected: "20 mins ago",
    riskTrend: "Stable"
  }
];

export const INITIAL_TIMELINE_LOGS = [
  {
    id: "log_01",
    timestamp: "2026-10-27 19:15",
    eventType: "Rainfall Alert",
    description: "Meteorological radar recorded heavy rain cell exceeding 65 mm/hr over Sukhumvit basin.",
    loggedBy: "System Sensor Grid",
    severity: "info"
  },
  {
    id: "log_02",
    timestamp: "2026-10-27 20:05",
    eventType: "Threshold Exceeded",
    description: "External street water level rose to 22 cm. Basement flood gates triggered to Level 1 standby.",
    loggedBy: "Juristic Safety Officer",
    severity: "warning"
  },
  {
    id: "log_03",
    timestamp: "2026-10-27 20:45",
    eventType: "Resident Advisory Sent",
    description: "Broadcast push notification sent to all 320 residential units: 'Move sedans parked on lower B2 ramp'.",
    loggedBy: "Juristic Management Desk",
    severity: "action"
  },
  {
    id: "log_04",
    timestamp: "2026-10-27 21:20",
    eventType: "Automated Floodgate Deployed",
    description: "Hydro-mechanical barrier locked in position at Entrance B1 Ramp. 3 sump pumps activated.",
    loggedBy: "Automated Facility Sensor",
    severity: "warning"
  },
  {
    id: "log_05",
    timestamp: "2026-10-27 21:55",
    eventType: "Photo Verification AI",
    description: "Resident submitted photo confirmed 34 cm street water level (AI Confidence 94%). Stored in claim audit ledger.",
    loggedBy: "AI Depth Verifier",
    severity: "verified"
  }
];

export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "ann_01",
    org: "Sukhumvit 39 Juristic Person",
    time: "25 mins ago",
    urgency: "HIGH",
    title: "Urgent: Move Sedans from Street Level to Level 3 Parking",
    body: "Water on Soi 39 is currently at 34 cm and continuing to rise. Sedans cannot pass through. Entrance ramp floodgates will seal in 45 minutes."
  },
  {
    id: "ann_02",
    org: "Bangkok Metropolitan Water Authority",
    time: "45 mins ago",
    urgency: "MEDIUM",
    title: "Canal Saen Saep Drainage Pumps Operating at Full Capacity",
    body: "Peak drainage underway. Expected water crest between 22:30 and 23:15."
  }
];
