import type { CityArea } from "@/lib/site-config";

export type TrendPoint = {
  label: string;
  actual: number;
  predicted?: number;
  optimized?: number;
};

export type DashboardAreaMetrics = {
  area: CityArea;
  avgSpeedKmh: number;
  congestionIndex: number;
  travelTimeReliability: number;
  incidentRisk: number;
  dailyTrips: number;
  observationCount?: number;
  classification: "Low" | "Moderate" | "Elevated" | "Severe";
  demandCurve: TrendPoint[];
  peakWindow: string;
  offPeakWindow: string;
};

export type ForecastModel = {
  name: string;
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  stability: number;
  summary: string;
  tag?: string;
};

export type SignalMetric = {
  label: string;
  baseline: number;
  optimized: number;
  unit: string;
};

export type Hotspot = {
  id: string;
  name: string;
  area: CityArea;
  severity: "Medium" | "High" | "Critical";
  congestionScore: number;
  averageDelay: number;
  queuePressure: number;
  improvementPotential: number;
  trend: "rising" | "stable" | "falling";
  coordinates: {
    x: number;
    y: number;
  };
};

export type RouteBlueprint = {
  id: string;
  name: string;
  description: string;
  via: CityArea[];
  baseDurationMin: number;
  distanceKm: number;
  resilienceScore: number;
};

export type ForecastDataPoint = {
  hour: string;
  actual: number | null;
  predicted: number;
  lower: number;
  upper: number;
};

export type FeatureImportance = {
  feature: string;
  importance: number;
  category: string;
};

export type TimingPhase = {
  phase: string;
  direction: string;
  baseline: number;
  optimized: number;
};

export type ScenarioResult = {
  id: string;
  name: string;
  timestamp: string;
  avgDelay: number;
  throughput: number;
  congestionIndex: number;
  travelTime: number;
  recommendation: string;
};

export type MonthlyTrend = {
  month: string;
  congestionIndex: number;
  avgDelay: number;
  throughput: number;
  incidents: number;
};

// ─── Dashboard Data ──────────────────────────────────────────────

export const dashboardMetrics: DashboardAreaMetrics[] = [
  {
    area: "Downtown Core",
    avgSpeedKmh: 21,
    congestionIndex: 78,
    travelTimeReliability: 62,
    incidentRisk: 18,
    dailyTrips: 124000,
    classification: "Severe",
    peakWindow: "07:30-09:30",
    offPeakWindow: "13:00-15:00",
    demandCurve: [
      { label: "06:00", actual: 42 },
      { label: "08:00", actual: 86 },
      { label: "10:00", actual: 65 },
      { label: "12:00", actual: 73 },
      { label: "14:00", actual: 58 },
      { label: "16:00", actual: 79 },
      { label: "18:00", actual: 88 },
      { label: "20:00", actual: 54 },
    ],
  },
  {
    area: "Harbourfront",
    avgSpeedKmh: 28,
    congestionIndex: 61,
    travelTimeReliability: 74,
    incidentRisk: 12,
    dailyTrips: 73200,
    classification: "Elevated",
    peakWindow: "08:00-09:00",
    offPeakWindow: "11:30-14:30",
    demandCurve: [
      { label: "06:00", actual: 30 },
      { label: "08:00", actual: 68 },
      { label: "10:00", actual: 49 },
      { label: "12:00", actual: 58 },
      { label: "14:00", actual: 52 },
      { label: "16:00", actual: 70 },
      { label: "18:00", actual: 76 },
      { label: "20:00", actual: 38 },
    ],
  },
  {
    area: "Midtown Loop",
    avgSpeedKmh: 32,
    congestionIndex: 56,
    travelTimeReliability: 79,
    incidentRisk: 10,
    dailyTrips: 89200,
    classification: "Elevated",
    peakWindow: "07:00-09:00",
    offPeakWindow: "12:30-14:30",
    demandCurve: [
      { label: "06:00", actual: 36 },
      { label: "08:00", actual: 72 },
      { label: "10:00", actual: 54 },
      { label: "12:00", actual: 51 },
      { label: "14:00", actual: 46 },
      { label: "16:00", actual: 74 },
      { label: "18:00", actual: 67 },
      { label: "20:00", actual: 42 },
    ],
  },
  {
    area: "Innovation District",
    avgSpeedKmh: 34,
    congestionIndex: 49,
    travelTimeReliability: 84,
    incidentRisk: 8,
    dailyTrips: 65400,
    classification: "Moderate",
    peakWindow: "07:30-09:30",
    offPeakWindow: "11:00-14:00",
    demandCurve: [
      { label: "06:00", actual: 28 },
      { label: "08:00", actual: 62 },
      { label: "10:00", actual: 45 },
      { label: "12:00", actual: 41 },
      { label: "14:00", actual: 38 },
      { label: "16:00", actual: 66 },
      { label: "18:00", actual: 61 },
      { label: "20:00", actual: 35 },
    ],
  },
  {
    area: "Airport Corridor",
    avgSpeedKmh: 39,
    congestionIndex: 44,
    travelTimeReliability: 86,
    incidentRisk: 11,
    dailyTrips: 57100,
    classification: "Moderate",
    peakWindow: "06:30-08:30",
    offPeakWindow: "11:00-15:00",
    demandCurve: [
      { label: "06:00", actual: 32 },
      { label: "08:00", actual: 58 },
      { label: "10:00", actual: 41 },
      { label: "12:00", actual: 39 },
      { label: "14:00", actual: 37 },
      { label: "16:00", actual: 52 },
      { label: "18:00", actual: 48 },
      { label: "20:00", actual: 31 },
    ],
  },
  {
    area: "University Belt",
    avgSpeedKmh: 26,
    congestionIndex: 64,
    travelTimeReliability: 70,
    incidentRisk: 15,
    dailyTrips: 96800,
    classification: "Elevated",
    peakWindow: "08:00-10:00",
    offPeakWindow: "13:00-15:30",
    demandCurve: [
      { label: "06:00", actual: 35 },
      { label: "08:00", actual: 77 },
      { label: "10:00", actual: 62 },
      { label: "12:00", actual: 69 },
      { label: "14:00", actual: 55 },
      { label: "16:00", actual: 71 },
      { label: "18:00", actual: 74 },
      { label: "20:00", actual: 40 },
    ],
  },
  {
    area: "Industrial East",
    avgSpeedKmh: 31,
    congestionIndex: 52,
    travelTimeReliability: 81,
    incidentRisk: 13,
    dailyTrips: 60800,
    classification: "Moderate",
    peakWindow: "06:00-08:00",
    offPeakWindow: "11:00-14:00",
    demandCurve: [
      { label: "06:00", actual: 44 },
      { label: "08:00", actual: 69 },
      { label: "10:00", actual: 53 },
      { label: "12:00", actual: 46 },
      { label: "14:00", actual: 42 },
      { label: "16:00", actual: 57 },
      { label: "18:00", actual: 49 },
      { label: "20:00", actual: 30 },
    ],
  },
  {
    area: "Riverside North",
    avgSpeedKmh: 36,
    congestionIndex: 41,
    travelTimeReliability: 88,
    incidentRisk: 7,
    dailyTrips: 41800,
    classification: "Low",
    peakWindow: "07:00-08:30",
    offPeakWindow: "10:30-15:00",
    demandCurve: [
      { label: "06:00", actual: 20 },
      { label: "08:00", actual: 46 },
      { label: "10:00", actual: 35 },
      { label: "12:00", actual: 33 },
      { label: "14:00", actual: 29 },
      { label: "16:00", actual: 44 },
      { label: "18:00", actual: 38 },
      { label: "20:00", actual: 22 },
    ],
  },
];

// ─── Forecasting Data ────────────────────────────────────────────

export const corridorForecast = [
  { label: "Mon", actual: 71, predicted: 74 },
  { label: "Tue", actual: 76, predicted: 78 },
  { label: "Wed", actual: 81, predicted: 80 },
  { label: "Thu", actual: 84, predicted: 86 },
  { label: "Fri", actual: 89, predicted: 91 },
  { label: "Sat", actual: 64, predicted: 67 },
  { label: "Sun", actual: 57, predicted: 59 },
] satisfies TrendPoint[];

export const forecastModels: ForecastModel[] = [
  {
    name: "Random Forest",
    mae: 83.854,
    rmse: 135.343,
    mape: 6.1,
    r2: 0.924,
    stability: 93,
    tag: "best",
    summary:
      "Best-performing model in the notebook benchmark export.",
  },
  {
    name: "XGBoost",
    mae: 85.812,
    rmse: 141.257,
    mape: 6.4,
    r2: 0.918,
    stability: 90,
    summary:
      "Strong peak-hour performance with robust nonlinear feature handling.",
  },
  {
    name: "TFT (Proxy structure)",
    mae: 86.015,
    rmse: 142.074,
    mape: 6.6,
    r2: 0.912,
    stability: 88,
    summary:
      "Transformer proxy benchmark for temporal sequence modeling.",
  },
  {
    name: "Naive Baseline (Lag 1)",
    mae: 170.873,
    rmse: 253.422,
    mape: 12.8,
    r2: 0.71,
    stability: 62,
    summary:
      "Reference baseline model included for comparative benchmarking.",
  },
];

export const hourlyForecastData: ForecastDataPoint[] = [
  { hour: "06:00", actual: 420, predicted: 435, lower: 410, upper: 460 },
  { hour: "07:00", actual: 680, predicted: 695, lower: 665, upper: 725 },
  { hour: "08:00", actual: 1240, predicted: 1210, lower: 1160, upper: 1260 },
  { hour: "09:00", actual: 1380, predicted: 1350, lower: 1290, upper: 1410 },
  { hour: "10:00", actual: 980, predicted: 1010, lower: 960, upper: 1060 },
  { hour: "11:00", actual: 870, predicted: 885, lower: 845, upper: 925 },
  { hour: "12:00", actual: 920, predicted: 940, lower: 900, upper: 980 },
  { hour: "13:00", actual: 890, predicted: 870, lower: 830, upper: 910 },
  { hour: "14:00", actual: 850, predicted: 865, lower: 825, upper: 905 },
  { hour: "15:00", actual: 1020, predicted: 1045, lower: 995, upper: 1095 },
  { hour: "16:00", actual: 1310, predicted: 1280, lower: 1230, upper: 1330 },
  { hour: "17:00", actual: 1520, predicted: 1490, lower: 1430, upper: 1550 },
  { hour: "18:00", actual: 1440, predicted: 1410, lower: 1350, upper: 1470 },
  { hour: "19:00", actual: 980, predicted: 1005, lower: 955, upper: 1055 },
  { hour: "20:00", actual: 620, predicted: 640, lower: 610, upper: 670 },
  { hour: "21:00", actual: 410, predicted: 425, lower: 400, upper: 450 },
];

export const featureImportanceData: FeatureImportance[] = [
  { feature: "Hour of Day", importance: 0.28, category: "Temporal" },
  { feature: "Day of Week", importance: 0.18, category: "Temporal" },
  { feature: "Previous Hour Volume", importance: 0.15, category: "Lag" },
  { feature: "Rolling 3hr Average", importance: 0.12, category: "Lag" },
  { feature: "Is Peak Hour", importance: 0.08, category: "Temporal" },
  { feature: "Temperature", importance: 0.06, category: "Weather" },
  { feature: "Precipitation", importance: 0.05, category: "Weather" },
  { feature: "Is Holiday", importance: 0.04, category: "Calendar" },
  { feature: "Road Construction", importance: 0.03, category: "Event" },
  { feature: "Special Event", importance: 0.01, category: "Event" },
];

export const modelComparisonMonthly = [
  { month: "Jan", xgboost: 11.2, rf: 13.8, lstm: 15.1, gru: 15.8 },
  { month: "Feb", xgboost: 12.1, rf: 14.4, lstm: 16.2, gru: 16.9 },
  { month: "Mar", xgboost: 11.8, rf: 13.5, lstm: 14.8, gru: 15.4 },
  { month: "Apr", xgboost: 12.8, rf: 14.9, lstm: 16.4, gru: 17.1 },
  { month: "May", xgboost: 13.1, rf: 15.2, lstm: 16.8, gru: 17.4 },
  { month: "Jun", xgboost: 12.4, rf: 14.2, lstm: 15.8, gru: 16.1 },
  { month: "Jul", xgboost: 11.9, rf: 13.7, lstm: 15.3, gru: 15.9 },
  { month: "Aug", xgboost: 12.6, rf: 14.5, lstm: 16.1, gru: 16.7 },
  { month: "Sep", xgboost: 13.4, rf: 15.6, lstm: 17.2, gru: 17.8 },
  { month: "Oct", xgboost: 12.2, rf: 14.1, lstm: 15.6, gru: 16.2 },
  { month: "Nov", xgboost: 11.6, rf: 13.3, lstm: 14.9, gru: 15.5 },
  { month: "Dec", xgboost: 13.8, rf: 16.1, lstm: 17.8, gru: 18.4 },
];

// ─── Signal Optimization Data ────────────────────────────────────

export const signalMetrics: SignalMetric[] = [
  { label: "Average Delay", baseline: 118, optimized: 74, unit: "sec/veh" },
  { label: "Throughput", baseline: 4820, optimized: 5610, unit: "veh/hr" },
  { label: "Queue Length", baseline: 73, optimized: 42, unit: "vehicles" },
  { label: "Travel Time", baseline: 31, optimized: 23, unit: "min" },
];

export const signalTrend = [
  { label: "06:00", actual: 52, optimized: 46 },
  { label: "08:00", actual: 79, optimized: 61 },
  { label: "10:00", actual: 64, optimized: 52 },
  { label: "12:00", actual: 58, optimized: 48 },
  { label: "14:00", actual: 54, optimized: 45 },
  { label: "16:00", actual: 83, optimized: 65 },
  { label: "18:00", actual: 88, optimized: 67 },
  { label: "20:00", actual: 49, optimized: 41 },
] satisfies TrendPoint[];

export const timingPhases: TimingPhase[] = [
  { phase: "Phase 1", direction: "NB/SB Through", baseline: 45, optimized: 52 },
  { phase: "Phase 2", direction: "NB/SB Left Turn", baseline: 15, optimized: 12 },
  { phase: "Phase 3", direction: "EB/WB Through", baseline: 35, optimized: 28 },
  { phase: "Phase 4", direction: "EB/WB Left Turn", baseline: 15, optimized: 10 },
  { phase: "Pedestrian", direction: "All Crosswalks", baseline: 30, optimized: 28 },
];

export const delayByApproach = [
  { approach: "Northbound", baseline: 42, optimized: 28 },
  { approach: "Southbound", baseline: 38, optimized: 24 },
  { approach: "Eastbound", baseline: 52, optimized: 31 },
  { approach: "Westbound", baseline: 48, optimized: 29 },
];

export const vcRatioData = [
  { hour: "06:00", baseline: 0.62, optimized: 0.58 },
  { hour: "07:00", baseline: 0.78, optimized: 0.71 },
  { hour: "08:00", baseline: 0.95, optimized: 0.82 },
  { hour: "09:00", baseline: 0.91, optimized: 0.79 },
  { hour: "10:00", baseline: 0.73, optimized: 0.65 },
  { hour: "11:00", baseline: 0.68, optimized: 0.61 },
  { hour: "12:00", baseline: 0.71, optimized: 0.64 },
  { hour: "13:00", baseline: 0.69, optimized: 0.62 },
  { hour: "14:00", baseline: 0.72, optimized: 0.64 },
  { hour: "15:00", baseline: 0.84, optimized: 0.74 },
  { hour: "16:00", baseline: 0.97, optimized: 0.84 },
  { hour: "17:00", baseline: 1.04, optimized: 0.89 },
  { hour: "18:00", baseline: 0.98, optimized: 0.85 },
  { hour: "19:00", baseline: 0.76, optimized: 0.68 },
  { hour: "20:00", baseline: 0.59, optimized: 0.54 },
];

// ─── Hotspot Data ────────────────────────────────────────────────

export const hotspots: Hotspot[] = [
  {
    id: "ht-01",
    name: "King St x Spadina Ave",
    area: "Downtown Core",
    severity: "Critical",
    congestionScore: 92,
    averageDelay: 6.8,
    queuePressure: 88,
    improvementPotential: 26,
    trend: "rising",
    coordinates: { x: 48, y: 44 },
  },
  {
    id: "ht-02",
    name: "Front St x Bay St",
    area: "Downtown Core",
    severity: "Critical",
    congestionScore: 89,
    averageDelay: 6.1,
    queuePressure: 84,
    improvementPotential: 22,
    trend: "stable",
    coordinates: { x: 54, y: 52 },
  },
  {
    id: "ht-03",
    name: "Queens Quay x York",
    area: "Harbourfront",
    severity: "High",
    congestionScore: 81,
    averageDelay: 4.7,
    queuePressure: 73,
    improvementPotential: 18,
    trend: "rising",
    coordinates: { x: 58, y: 66 },
  },
  {
    id: "ht-04",
    name: "University Ave x College",
    area: "University Belt",
    severity: "High",
    congestionScore: 78,
    averageDelay: 4.2,
    queuePressure: 69,
    improvementPotential: 17,
    trend: "falling",
    coordinates: { x: 46, y: 36 },
  },
  {
    id: "ht-05",
    name: "Eglinton Ave x Yonge",
    area: "Midtown Loop",
    severity: "High",
    congestionScore: 76,
    averageDelay: 3.9,
    queuePressure: 65,
    improvementPotential: 14,
    trend: "stable",
    coordinates: { x: 44, y: 24 },
  },
  {
    id: "ht-06",
    name: "Port Lands Gate",
    area: "Industrial East",
    severity: "Medium",
    congestionScore: 67,
    averageDelay: 3.1,
    queuePressure: 57,
    improvementPotential: 12,
    trend: "falling",
    coordinates: { x: 72, y: 56 },
  },
  {
    id: "ht-07",
    name: "Dundas St x University",
    area: "Downtown Core",
    severity: "High",
    congestionScore: 74,
    averageDelay: 3.8,
    queuePressure: 62,
    improvementPotential: 15,
    trend: "stable",
    coordinates: { x: 42, y: 38 },
  },
  {
    id: "ht-08",
    name: "Bloor St x Yonge",
    area: "Midtown Loop",
    severity: "High",
    congestionScore: 72,
    averageDelay: 3.5,
    queuePressure: 59,
    improvementPotential: 13,
    trend: "rising",
    coordinates: { x: 50, y: 30 },
  },
];

// ─── Monthly Trends ──────────────────────────────────────────────

export const monthlyTrends: MonthlyTrend[] = [
  { month: "Jan", congestionIndex: 58, avgDelay: 42, throughput: 4200, incidents: 12 },
  { month: "Feb", congestionIndex: 55, avgDelay: 39, throughput: 4350, incidents: 9 },
  { month: "Mar", congestionIndex: 62, avgDelay: 45, throughput: 4100, incidents: 14 },
  { month: "Apr", congestionIndex: 68, avgDelay: 51, throughput: 3950, incidents: 18 },
  { month: "May", congestionIndex: 72, avgDelay: 55, throughput: 3800, incidents: 21 },
  { month: "Jun", congestionIndex: 75, avgDelay: 58, throughput: 3700, incidents: 24 },
  { month: "Jul", congestionIndex: 70, avgDelay: 52, throughput: 3850, incidents: 19 },
  { month: "Aug", congestionIndex: 67, avgDelay: 49, throughput: 3950, incidents: 16 },
  { month: "Sep", congestionIndex: 78, avgDelay: 62, throughput: 3600, incidents: 28 },
  { month: "Oct", congestionIndex: 74, avgDelay: 56, throughput: 3750, incidents: 22 },
  { month: "Nov", congestionIndex: 65, avgDelay: 47, throughput: 4050, incidents: 15 },
  { month: "Dec", congestionIndex: 61, avgDelay: 44, throughput: 4150, incidents: 13 },
];

// ─── Scenario Testing Data ───────────────────────────────────────

export const scenarioHistory: ScenarioResult[] = [
  {
    id: "sc-01",
    name: "Peak Hour + 20% Surge",
    timestamp: "2026-03-18 14:30",
    avgDelay: 142,
    throughput: 4120,
    congestionIndex: 84,
    travelTime: 38,
    recommendation: "Deploy adaptive signal timing with 15% green extension on primary arterial.",
  },
  {
    id: "sc-02",
    name: "Baseline (No Change)",
    timestamp: "2026-03-18 14:25",
    avgDelay: 118,
    throughput: 4820,
    congestionIndex: 72,
    travelTime: 31,
    recommendation: "Current timing plan adequate for normal demand levels.",
  },
  {
    id: "sc-03",
    name: "Weather Event + Incident",
    timestamp: "2026-03-17 10:15",
    avgDelay: 168,
    throughput: 3650,
    congestionIndex: 91,
    travelTime: 45,
    recommendation: "Activate incident management protocol. Reroute via Harbourfront corridor.",
  },
];

export const actualVsPredicted = [
  { hour: "06:00", actual: 420, predicted: 435 },
  { hour: "07:00", actual: 680, predicted: 695 },
  { hour: "08:00", actual: 1240, predicted: 1210 },
  { hour: "09:00", actual: 1380, predicted: 1350 },
  { hour: "10:00", actual: 980, predicted: 1010 },
  { hour: "11:00", actual: 870, predicted: 885 },
  { hour: "12:00", actual: 920, predicted: 940 },
  { hour: "13:00", actual: 890, predicted: 870 },
  { hour: "14:00", actual: 850, predicted: 865 },
  { hour: "15:00", actual: 1020, predicted: 1045 },
  { hour: "16:00", actual: 1310, predicted: 1280 },
  { hour: "17:00", actual: 1520, predicted: 1490 },
  { hour: "18:00", actual: 1440, predicted: 1410 },
  { hour: "19:00", actual: 980, predicted: 1005 },
  { hour: "20:00", actual: 620, predicted: 640 },
];

// ─── Route Blueprints ────────────────────────────────────────────

export const routeBlueprints: Record<string, RouteBlueprint[]> = {
  "Downtown Core:Airport Corridor": [
    {
      id: "route-01",
      name: "Balanced express corridor",
      description:
        "Uses the adaptive signal spine through Innovation District before merging onto the airport connector.",
      via: ["Innovation District", "Airport Corridor"],
      baseDurationMin: 34,
      distanceKm: 24.1,
      resilienceScore: 84,
    },
    {
      id: "route-02",
      name: "Waterfront bypass",
      description:
        "Lower incident sensitivity via Harbourfront with steadier speeds and fewer downtown choke points.",
      via: ["Harbourfront", "Airport Corridor"],
      baseDurationMin: 37,
      distanceKm: 25.9,
      resilienceScore: 89,
    },
    {
      id: "route-03",
      name: "Midtown arterial lift",
      description:
        "Longer distance but less severe peak pressure when the downtown grid is saturated.",
      via: ["Midtown Loop", "Airport Corridor"],
      baseDurationMin: 41,
      distanceKm: 29.7,
      resilienceScore: 76,
    },
  ],
  "University Belt:Harbourfront": [
    {
      id: "route-04",
      name: "Academic spine direct",
      description:
        "Shortest path through the university spine with strong signal offsets outside the a.m. peak.",
      via: ["Downtown Core", "Harbourfront"],
      baseDurationMin: 24,
      distanceKm: 11.7,
      resilienceScore: 81,
    },
    {
      id: "route-05",
      name: "Riverside relief",
      description:
        "Leans on Riverside North to avoid downtown spillback when event traffic builds near the waterfront.",
      via: ["Riverside North", "Harbourfront"],
      baseDurationMin: 28,
      distanceKm: 13.6,
      resilienceScore: 88,
    },
  ],
  "Midtown Loop:Industrial East": [
    {
      id: "route-06",
      name: "Crosstown industrial link",
      description:
        "Pairs crosstown flow prediction with lower queue pressure on the east freight approach.",
      via: ["University Belt", "Industrial East"],
      baseDurationMin: 29,
      distanceKm: 18.8,
      resilienceScore: 82,
    },
    {
      id: "route-07",
      name: "Downtown distributor",
      description:
        "Faster on weekends when downtown parking demand collapses and arterial speeds recover.",
      via: ["Downtown Core", "Industrial East"],
      baseDurationMin: 27,
      distanceKm: 17.2,
      resilienceScore: 71,
    },
  ],
};
