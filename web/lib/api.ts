import {
  dashboardMetrics,
  corridorForecast,
  forecastModels,
  hourlyForecastData,
  featureImportanceData,
  modelComparisonMonthly,
  signalMetrics,
  signalTrend,
  timingPhases,
  delayByApproach,
  vcRatioData,
  hotspots,
  monthlyTrends,
  scenarioHistory,
  actualVsPredicted,
  type DashboardAreaMetrics,
  type ForecastModel,
  type ForecastDataPoint,
  type FeatureImportance,
  type SignalMetric,
  type TrendPoint,
  type TimingPhase,
  type Hotspot,
  type MonthlyTrend,
  type ScenarioResult,
} from "@/features/traffic/data/demo-data";
import type { CityArea } from "@/lib/site-config";

const USE_MOCK = true;

async function fetchApi<T>(endpoint: string, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;

  try {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ─── Dashboard ───────────────────────────────────────────────────

export type DashboardSummary = {
  avgCongestionIndex: number;
  avgReliability: number;
  totalTrips: number;
  activeIntersections: number;
  delayReduction: number;
  forecastAccuracy: number;
  areas: DashboardAreaMetrics[];
  monthlyTrends: MonthlyTrend[];
  topHotspots: Hotspot[];
  recentScenarios: ScenarioResult[];
  actualVsPredicted: { hour: string; actual: number; predicted: number }[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const areas = dashboardMetrics;
  const avgCI = Math.round(
    areas.reduce((s, a) => s + a.congestionIndex, 0) / areas.length,
  );
  const avgRel = Math.round(
    areas.reduce((s, a) => s + a.travelTimeReliability, 0) / areas.length,
  );
  const totalTrips = areas.reduce((s, a) => s + a.dailyTrips, 0);

  return fetchApi<DashboardSummary>("/dashboard-summary", {
    avgCongestionIndex: avgCI,
    avgReliability: avgRel,
    totalTrips,
    activeIntersections: 1240,
    delayReduction: 37.3,
    forecastAccuracy: 92.4,
    areas,
    monthlyTrends,
    topHotspots: hotspots.slice(0, 5),
    recentScenarios: scenarioHistory,
    actualVsPredicted,
  });
}

// ─── Forecasting ─────────────────────────────────────────────────

export type ForecastResponse = {
  models: ForecastModel[];
  bestModel: ForecastModel;
  hourlyData: ForecastDataPoint[];
  featureImportance: FeatureImportance[];
  modelComparison: typeof modelComparisonMonthly;
  weeklyTrend: TrendPoint[];
};

export async function getForecastData(): Promise<ForecastResponse> {
  const ranked = [...forecastModels].sort((a, b) => a.mae - b.mae);
  return fetchApi<ForecastResponse>("/forecast", {
    models: ranked,
    bestModel: ranked[0],
    hourlyData: hourlyForecastData,
    featureImportance: featureImportanceData,
    modelComparison: modelComparisonMonthly,
    weeklyTrend: corridorForecast,
  });
}

// ─── Signal Optimization ─────────────────────────────────────────

export type SignalOptResponse = {
  metrics: SignalMetric[];
  trend: TrendPoint[];
  timingPhases: TimingPhase[];
  delayByApproach: typeof delayByApproach;
  vcRatio: typeof vcRatioData;
  improvementRate: number;
  corridor: string;
  cycleLength: { baseline: number; optimized: number };
};

export async function getSignalOptData(): Promise<SignalOptResponse> {
  return fetchApi<SignalOptResponse>("/optimization-result", {
    metrics: signalMetrics,
    trend: signalTrend,
    timingPhases,
    delayByApproach,
    vcRatio: vcRatioData,
    improvementRate: 37,
    corridor: "Downtown Core — King St x Spadina Ave",
    cycleLength: { baseline: 140, optimized: 120 },
  });
}

// ─── Hotspots ────────────────────────────────────────────────────

export type HotspotResponse = {
  hotspots: Hotspot[];
  criticalCount: number;
  highCount: number;
  avgSeverity: number;
};

export async function getHotspotData(): Promise<HotspotResponse> {
  const sorted = [...hotspots].sort(
    (a, b) => b.congestionScore - a.congestionScore,
  );
  return fetchApi<HotspotResponse>("/hotspots", {
    hotspots: sorted,
    criticalCount: sorted.filter((h) => h.severity === "Critical").length,
    highCount: sorted.filter((h) => h.severity === "High").length,
    avgSeverity: +(
      sorted.reduce((s, h) => s + h.congestionScore, 0) / sorted.length
    ).toFixed(1),
  });
}

// ─── Scenario Testing ────────────────────────────────────────────

export type ScenarioInput = {
  trafficSurge: number;
  hasIncident: boolean;
  weatherCondition: "clear" | "rain" | "snow";
  timingStrategy: "fixed" | "adaptive" | "actuated";
  demandLevel: "low" | "normal" | "high" | "extreme";
};

export type ScenarioOutput = {
  avgDelay: number;
  throughput: number;
  congestionIndex: number;
  travelTime: number;
  queueLength: number;
  co2Reduction: number;
  recommendation: string;
  comparedToBaseline: {
    delayChange: number;
    throughputChange: number;
    congestionChange: number;
  };
};

export async function runScenario(
  input: ScenarioInput,
): Promise<ScenarioOutput> {
  const baseDelay = 118;
  const surgeMultiplier = 1 + input.trafficSurge / 100;
  const incidentPenalty = input.hasIncident ? 1.35 : 1;
  const weatherPenalty =
    input.weatherCondition === "snow"
      ? 1.25
      : input.weatherCondition === "rain"
        ? 1.12
        : 1;
  const demandMultiplier =
    input.demandLevel === "extreme"
      ? 1.4
      : input.demandLevel === "high"
        ? 1.2
        : input.demandLevel === "low"
          ? 0.8
          : 1;
  const strategyBonus =
    input.timingStrategy === "adaptive"
      ? 0.72
      : input.timingStrategy === "actuated"
        ? 0.8
        : 1;

  const rawDelay =
    baseDelay *
    surgeMultiplier *
    incidentPenalty *
    weatherPenalty *
    demandMultiplier;
  const finalDelay = Math.round(rawDelay * strategyBonus);
  const baseThroughput = 4820;
  const throughput = Math.round(
    baseThroughput * (1 / (rawDelay / baseDelay)) * (1 / strategyBonus) * 0.95,
  );
  const congestion = Math.min(
    99,
    Math.round(((finalDelay - 40) / 160) * 100),
  );
  const travelTime = Math.round(23 + (finalDelay - 74) * 0.12);
  const queue = Math.round(42 + (finalDelay - 74) * 0.35);
  const co2 = +((1 - finalDelay / rawDelay) * 100).toFixed(1);

  return {
    avgDelay: finalDelay,
    throughput,
    congestionIndex: congestion,
    travelTime: Math.max(18, travelTime),
    queueLength: Math.max(15, queue),
    co2Reduction: co2,
    recommendation:
      finalDelay > 150
        ? "High congestion expected. Deploy adaptive timing with demand management."
        : finalDelay > 100
          ? "Moderate pressure. Adaptive timing recommended for primary corridor."
          : "System operating within acceptable parameters.",
    comparedToBaseline: {
      delayChange: +((finalDelay / baseDelay - 1) * 100).toFixed(1),
      throughputChange: +((throughput / baseThroughput - 1) * 100).toFixed(1),
      congestionChange: congestion - 72,
    },
  };
}

// ─── Health / Metadata ───────────────────────────────────────────

export type SystemHealth = {
  status: "operational" | "degraded" | "offline";
  lastUpdate: string;
  modelVersion: string;
  dataPoints: number;
  intersections: number;
};

export function getSystemHealth(): SystemHealth {
  return {
    status: "operational",
    lastUpdate: new Date().toISOString(),
    modelVersion: "v2.4.1-prod",
    dataPoints: 2847592,
    intersections: 1240,
  };
}
