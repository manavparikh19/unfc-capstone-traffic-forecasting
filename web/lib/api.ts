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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const ALLOW_FALLBACK_ON_ERROR =
  process.env.NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR === "true";

async function fetchApi<T>(
  endpoint: string,
  fallback: T,
  options?: { allowFallback?: boolean },
): Promise<T> {
  if (USE_MOCK) return fallback;

  try {
    const res = await fetch(`/api${endpoint}`, { cache: "no-store" });
    if (!res.ok) {
      let message = `API ${res.status}`;
      try {
        const payload = (await res.json()) as { message?: string };
        if (payload?.message) {
          message = payload.message;
        }
      } catch {
        // Keep default message when response is not JSON.
      }
      throw new Error(message);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (options?.allowFallback ?? ALLOW_FALLBACK_ON_ERROR) {
      return fallback;
    }
    throw error;
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
  networkObservationCount?: number;
  hotspotObservationCount?: number;
  locationOptions?: Array<{ locationId: string; label: string }>;
  selectedLocationId?: string;
  generatedAt?: string;
};

export async function getDashboardSummary(query?: {
  locationId?: string;
  peakWindow?: "all" | "am" | "pm" | "offpeak";
}): Promise<DashboardSummary> {
  const areas = dashboardMetrics;
  const avgCI = Math.round(
    areas.reduce((s, a) => s + a.congestionIndex, 0) / areas.length,
  );
  const avgRel = Math.round(
    areas.reduce((s, a) => s + a.travelTimeReliability, 0) / areas.length,
  );
  const totalTrips = areas.reduce((s, a) => s + a.dailyTrips, 0);

  const search = new URLSearchParams();
  if (query?.locationId) {
    search.set("locationId", query.locationId);
  }
  if (query?.peakWindow) {
    search.set("peakWindow", query.peakWindow);
  }
  const endpoint =
    search.size > 0 ? `/dashboard-summary?${search.toString()}` : "/dashboard-summary";

  return fetchApi<DashboardSummary>(endpoint, {
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
    networkObservationCount: 0,
    hotspotObservationCount: 0,
    locationOptions: [],
    selectedLocationId: query?.locationId ?? "ALL",
  }, { allowFallback: false });
}

// ─── Forecasting ─────────────────────────────────────────────────

export type ForecastResponse = {
  models: ForecastModel[];
  bestModel: ForecastModel;
  selectedModel?: ForecastModel;
  hourlyData: ForecastDataPoint[];
  featureImportance: FeatureImportance[];
  modelComparison: typeof modelComparisonMonthly;
  weeklyTrend: TrendPoint[];
  meta?: {
    model_name?: string;
    location_id?: string;
    horizon_hours?: number;
    start_timestamp?: string;
    trained_rows?: number;
    actual_coverage?: number;
  };
};

export type ForecastLocationOption = {
  locationId: string;
  label: string;
};

type ForecastQuery = {
  intersection?: string;
  horizonHours?: number;
  locationId?: string;
  modelName?: string;
  startTimestamp?: string;
};

export async function getForecastData(
  query?: ForecastQuery,
): Promise<ForecastResponse> {
  const ranked = [...forecastModels].sort((a, b) => a.mae - b.mae);
  const search = new URLSearchParams();
  if (query?.intersection) search.set("intersection", query.intersection);
  if (query?.locationId) search.set("locationId", query.locationId);
  if (query?.modelName) search.set("modelName", query.modelName);
  if (query?.startTimestamp) search.set("startTimestamp", query.startTimestamp);
  if (query?.horizonHours) {
    search.set("horizonHours", String(query.horizonHours));
  }

  const endpoint = search.size > 0 ? `/forecast?${search.toString()}` : "/forecast";

  return fetchApi<ForecastResponse>(endpoint, {
    models: ranked,
    bestModel: ranked[0],
    hourlyData: hourlyForecastData,
    featureImportance: featureImportanceData,
    modelComparison: modelComparisonMonthly,
    weeklyTrend: corridorForecast,
  });
}

export async function getForecastLocations(): Promise<ForecastLocationOption[]> {
  const fallback: ForecastLocationOption[] = [
    { locationId: "10133019_NB", label: "King St x Spadina Ave" },
    { locationId: "913150_WB", label: "Front St x Bay St" },
    { locationId: "8417204_WB", label: "Eglinton Ave x Yonge" },
    { locationId: "913167_EB", label: "University Ave x College" },
  ];

  if (USE_MOCK) return fallback;

  try {
    const res = await fetch("/api/forecast/locations");
    if (!res.ok) throw new Error(`API ${res.status}`);
    const payload = (await res.json()) as { locations?: ForecastLocationOption[] };
    if (!payload.locations || payload.locations.length === 0) {
      throw new Error("No locations returned.");
    }
    return payload.locations;
  } catch (error) {
    if (ALLOW_FALLBACK_ON_ERROR) {
      return fallback;
    }
    throw error;
  }
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
  observationCount?: number;
  locationOptions?: Array<{ locationId: string; label: string }>;
  selectedLocationId?: string;
  selectedPeakWindow?: "all" | "am" | "pm" | "offpeak";
};

export async function getSignalOptData(query?: {
  locationId?: string;
  peakWindow?: "all" | "am" | "pm" | "offpeak";
}): Promise<SignalOptResponse> {
  const search = new URLSearchParams();
  if (query?.locationId) search.set("locationId", query.locationId);
  if (query?.peakWindow) search.set("peakWindow", query.peakWindow);
  const endpoint =
    search.size > 0
      ? `/optimization-result?${search.toString()}`
      : "/optimization-result";

  return fetchApi<SignalOptResponse>(endpoint, {
    metrics: signalMetrics,
    trend: signalTrend,
    timingPhases,
    delayByApproach,
    vcRatio: vcRatioData,
    improvementRate: 37,
    corridor: "Downtown Core — King St x Spadina Ave",
    cycleLength: { baseline: 140, optimized: 120 },
    observationCount: 0,
    locationOptions: [],
    selectedLocationId: query?.locationId ?? "ALL",
    selectedPeakWindow: query?.peakWindow ?? "all",
  }, { allowFallback: false });
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

export type ScenarioHistoryItem = {
  id: string;
  name: string;
  timestamp: string;
  avgDelay: number;
  throughput: number;
  congestionIndex: number;
  travelTime: number;
  recommendation: string;
};

export type ScenarioRunResponse = {
  result: ScenarioOutput;
  baseline: ScenarioOutput;
  history: ScenarioHistoryItem[];
};

function simulateScenarioFallback(input: ScenarioInput): ScenarioOutput {
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

export async function runScenarioWithBaseline(
  input: ScenarioInput,
): Promise<ScenarioRunResponse> {
  if (USE_MOCK) {
    const result = simulateScenarioFallback(input);
    const baseline = simulateScenarioFallback({
      trafficSurge: 0,
      hasIncident: false,
      weatherCondition: "clear",
      timingStrategy: "fixed",
      demandLevel: "normal",
    });
    return { result, baseline, history: scenarioHistory };
  }
  const res = await fetch("/api/scenario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `API ${res.status}`;
    try {
      const payload = (await res.json()) as { message?: string };
      if (payload?.message) message = payload.message;
    } catch {
      // ignore non-json failure response
    }
    throw new Error(message);
  }
  return (await res.json()) as ScenarioRunResponse;
}

export async function runScenario(
  input: ScenarioInput,
): Promise<ScenarioOutput> {
  const payload = await runScenarioWithBaseline(input);
  return payload.result;
}

export async function getScenarioHistory(): Promise<ScenarioHistoryItem[]> {
  return fetchApi<{ history: ScenarioHistoryItem[] }>(
    "/scenario",
    { history: scenarioHistory },
    { allowFallback: false },
  ).then((payload) => payload.history);
}

// ─── Methodology ────────────────────────────────────────────────

export type MethodologySummary = {
  dataset: {
    dataPoints: number;
    intersections: number;
    timeSpan: string;
    resolution: string;
  };
  metrics: Array<{
    metric: string;
    value: string;
    desc: string;
  }>;
  models: Array<{
    name: string;
    mae: number;
    rmse: number;
  }>;
};

export async function getMethodologySummary(): Promise<MethodologySummary> {
  const res = await fetch("/api/methodology-summary", { cache: "no-store" });
  if (!res.ok) {
    let message = `API ${res.status}`;
    try {
      const payload = (await res.json()) as { message?: string };
      if (payload?.message) message = payload.message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
  return (await res.json()) as MethodologySummary;
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
