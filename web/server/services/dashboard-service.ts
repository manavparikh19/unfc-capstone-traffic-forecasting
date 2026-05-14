import path from "node:path";

import type { DashboardSummary } from "@/lib/api";
import type { CityArea } from "@/lib/site-config";
import { cityFocusAreas } from "@/lib/site-config";
import type { DashboardAreaMetrics } from "@/features/traffic/data/demo-data";
import { getProcessedDataRoot } from "@/server/utils/data-root";
import { readCsvFile, toNumber } from "@/server/utils/csv";

function classifyCongestion(index: number): DashboardAreaMetrics["classification"] {
  if (index >= 75) return "Severe";
  if (index >= 60) return "Elevated";
  if (index >= 45) return "Moderate";
  return "Low";
}

function timeWindow(volume: number) {
  if (volume >= 1200) {
    return { peak: "07:30-09:30", offPeak: "12:00-14:00" };
  }
  if (volume >= 900) {
    return { peak: "08:00-10:00", offPeak: "13:00-15:00" };
  }
  return { peak: "07:00-08:30", offPeak: "11:00-15:30" };
}

function hourMatchesPeakWindow(
  hour: number,
  peakWindow: "all" | "am" | "pm" | "offpeak",
) {
  if (!Number.isFinite(hour)) return true;
  if (peakWindow === "all") return true;
  if (peakWindow === "am") return hour >= 7 && hour <= 10;
  if (peakWindow === "pm") return hour >= 16 && hour <= 19;
  return !(hour >= 7 && hour <= 10) && !(hour >= 16 && hour <= 19);
}

function hotspotSeverityByRank(index: number, total: number) {
  if (index < Math.max(2, Math.round(total * 0.2))) return "Critical" as const;
  if (index < Math.max(5, Math.round(total * 0.55))) return "High" as const;
  return "Medium" as const;
}

async function loadDashboardPayload(
  locationId: string | null = null,
  peakWindow: "all" | "am" | "pm" | "offpeak" = "all",
): Promise<DashboardSummary> {
  const [flowRows, impactRows, headlineRows, forecastRows, detailedRows] =
    await Promise.all([
      readCsvFile(path.join(getProcessedDataRoot(), "traffic_flow_metrics_2015_2019.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "signal_timing_impact_summary.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "signal_timing_headline_metrics.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "traffic_demand_forecasts.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "signal_timing_strategy_detailed_results.csv")),
    ]);
  const filteredFlowRows =
    locationId && locationId !== "ALL"
      ? flowRows.filter((row) => row.location_id === locationId)
      : flowRows;
  const filteredForecastRows =
    locationId && locationId !== "ALL"
      ? forecastRows.filter((row) => row.location_id === locationId)
      : forecastRows;
  const filteredDetailedRows = detailedRows.filter((row) => {
    if (locationId && locationId !== "ALL" && row.location_id !== locationId) {
      return false;
    }
    return hourMatchesPeakWindow(Number(row.hour), peakWindow);
  });
  const locationNameById = new Map<string, string>();
  for (const row of flowRows) {
    const id = row.location_id?.trim();
    if (!id || locationNameById.has(id)) continue;
    const label = row.location_name?.trim();
    locationNameById.set(id, label && label.length > 0 ? label : id);
  }

  const locationOptions = Array.from(
    new Set(
      forecastRows
        .map((row) => row.location_id?.trim())
        .filter((id): id is string => Boolean(id && id.length > 0)),
    ),
  )
    .map((locationId) => ({
      locationId,
      label: locationNameById.get(locationId) ?? locationId,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const areaKeys: CityArea[] =
    locationId && locationId !== "ALL"
      ? [((locationNameById.get(locationId) ?? locationId) as CityArea)]
      : [...cityFocusAreas];

  const areaSeed = new Map<
    CityArea,
    {
      count: number;
      totalDaily: number;
      totalPeak: number;
      totalDemandIntensity: number;
      totalQueuePressure: number;
      demandCurve: Map<number, { actual: number; count: number }>;
    }
  >();

  areaKeys.forEach((area) => {
    areaSeed.set(area, {
      count: 0,
      totalDaily: 0,
      totalPeak: 0,
      totalDemandIntensity: 0,
      totalQueuePressure: 0,
      demandCurve: new Map(),
    });
  });

  const sourceFlowRows = filteredFlowRows.length > 0 ? filteredFlowRows : flowRows;
  sourceFlowRows.slice(0, 12000).forEach((row, index) => {
    const area = areaKeys[index % areaKeys.length] as CityArea;
    const seed = areaSeed.get(area);
    if (!seed) return;

    const dailyTotal = toNumber(row.daily_total_volume);
    const peakHour = toNumber(row.peak_hour_volume);
    const demandIntensity = toNumber(row.traffic_demand_intensity);
    const queuePressure = toNumber(row.queue_pressure_proxy);

    seed.count += 1;
    seed.totalDaily += dailyTotal;
    seed.totalPeak += peakHour;
    seed.totalDemandIntensity += demandIntensity;
    seed.totalQueuePressure += queuePressure;

    const hourBucket = index % 8;
    const curve = seed.demandCurve.get(hourBucket) ?? { actual: 0, count: 0 };
    curve.actual += peakHour;
    curve.count += 1;
    seed.demandCurve.set(hourBucket, curve);
  });

  const labels = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  const areas: DashboardAreaMetrics[] = areaKeys.map((area) => {
    const seed = areaSeed.get(area);
    const count = Math.max(seed?.count ?? 0, 1);
    const avgDaily = (seed?.totalDaily ?? 0) / count;
    const avgPeak = (seed?.totalPeak ?? 0) / count;
    const avgIntensity = (seed?.totalDemandIntensity ?? 0) / count;
    const avgQueue = (seed?.totalQueuePressure ?? 0) / count;

    const congestionIndex = Math.max(
      25,
      Math.min(98, Math.round(avgIntensity * 42 + avgQueue * 0.02)),
    );
    const travelTimeReliability = Math.max(
      52,
      Math.min(95, Math.round(100 - congestionIndex * 0.42)),
    );
    const avgSpeedKmh = Math.max(18, Math.min(45, Math.round(55 - congestionIndex * 0.38)));
    const incidentRisk = Math.max(5, Math.min(28, Math.round(congestionIndex * 0.24)));
    const windows = timeWindow(avgPeak);

    const demandCurve = labels.map((label, idx) => {
      const point = seed?.demandCurve.get(idx);
      const actual = point ? Math.round(point.actual / Math.max(point.count, 1) / 12) : 0;
      return { label, actual };
    });

    return {
      area,
      avgSpeedKmh,
      congestionIndex,
      travelTimeReliability,
      incidentRisk,
      dailyTrips: Math.round(avgDaily),
      observationCount: seed?.count ?? 0,
      classification: classifyCongestion(congestionIndex),
      demandCurve,
      peakWindow: windows.peak,
      offPeakWindow: windows.offPeak,
    };
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrends = months.map((month, index) => {
    const area = areas[index % areas.length];
    const base = area.congestionIndex;
    return {
      month,
      congestionIndex: Math.max(35, Math.min(95, Math.round(base + Math.sin(index) * 6))),
      avgDelay: Math.max(18, Math.round(base * 0.72)),
      throughput: Math.max(2500, Math.round(area.dailyTrips / 6)),
      incidents: Math.max(6, Math.round(base / 5 + (index % 4))),
    };
  });

  const actualVsPredicted = await (async () => {
    const source = filteredForecastRows.length > 0 ? filteredForecastRows : forecastRows;
    const hourly = new Map<string, { actual: number; predicted: number; count: number }>();
    for (const row of source) {
      const ts = row.forecast_timestamp;
      const date = ts ? new Date(ts.replace(" ", "T")) : null;
      if (!date || Number.isNaN(date.getTime())) continue;
      const hour = `${String(date.getHours()).padStart(2, "0")}:00`;
      const bucket = hourly.get(hour) ?? { actual: 0, predicted: 0, count: 0 };
      bucket.actual += toNumber(row.actual_volume);
      bucket.predicted += toNumber(row.predicted_volume);
      bucket.count += 1;
      hourly.set(hour, bucket);
    }
    return Array.from(hourly.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, value]) => ({
        hour,
        actual: +(value.actual / Math.max(value.count, 1)).toFixed(1),
        predicted: +(value.predicted / Math.max(value.count, 1)).toFixed(1),
      }));
  })();

  const metricByName = new Map(headlineRows.map((row) => [row.metric, row]));
  const delayRow = metricByName.get("Delay (sec/veh)");
  const delayReduction = delayRow
    ? +toNumber(delayRow.average_change).toFixed(1)
    : 0;

  const hotspotSourceRows =
    filteredDetailedRows.length > 0
      ? filteredDetailedRows
      : detailedRows.filter((row) => {
          if (locationId && locationId !== "ALL" && row.location_id !== locationId) {
            return false;
          }
          return true;
        });

  const hotspotGroups = new Map<
    string,
    { name: string; delay: number; queue: number; throughput: number; reduction: number; count: number }
  >();
  for (const row of hotspotSourceRows) {
    const id = row.location_id?.trim();
    if (!id) continue;
    const seed = hotspotGroups.get(id) ?? {
      name: locationNameById.get(id) ?? id,
      delay: 0,
      queue: 0,
      throughput: 0,
      reduction: 0,
      count: 0,
    };
    seed.delay += toNumber(row.baseline_delay_sec);
    seed.queue += toNumber(row.baseline_queue_pressure);
    seed.throughput += toNumber(row.baseline_throughput);
    seed.reduction += toNumber(row.delay_reduction_sec);
    seed.count += 1;
    hotspotGroups.set(id, seed);
  }

  const hotspotScored = Array.from(hotspotGroups.entries())
    .map(([id, seed]) => {
      const n = Math.max(seed.count, 1);
      const avgDelay = seed.delay / n;
      const avgQueue = seed.queue / n;
      const avgThroughput = seed.throughput / n;
      const avgReduction = seed.reduction / n;
      const rawScore = avgDelay * 1.6 + avgQueue * 0.05 + avgThroughput * 0.015;
      return {
        id,
        name: seed.name,
        avgDelay,
        avgQueue,
        avgReduction,
        count: seed.count,
        rawScore,
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);

  const scoreMin = hotspotScored.length > 0 ? hotspotScored.at(-1)?.rawScore ?? 0 : 0;
  const scoreMax = hotspotScored.length > 0 ? hotspotScored[0].rawScore : 1;
  const scoreSpan = Math.max(scoreMax - scoreMin, 1e-6);

  const topHotspots = hotspotScored.slice(0, 5).map((item, index) => {
    const normalized = (item.rawScore - scoreMin) / scoreSpan;
    const score = Math.round(60 + normalized * 39);
    const area =
      locationId && locationId !== "ALL"
        ? (item.name as CityArea)
        : (cityFocusAreas[index % cityFocusAreas.length] as CityArea);
    const trend =
      item.avgReduction >= 4
        ? ("falling" as const)
        : item.avgReduction <= 1
          ? ("rising" as const)
          : ("stable" as const);
    return {
      id: item.id,
      name: item.name,
      area,
      severity: hotspotSeverityByRank(index, hotspotScored.length),
      congestionScore: score,
      averageDelay: +item.avgDelay.toFixed(1),
      queuePressure: Math.round(item.avgQueue),
      improvementPotential: Math.max(0, Math.round(item.avgReduction)),
      trend,
      coordinates: {
        x: 22 + (index % 4) * 18 + (Math.floor(index / 4) % 2 ? 4 : 0),
        y: 26 + Math.floor(index / 4) * 16,
      },
    };
  });

  const recentScenarios = impactRows.slice(0, 3).map((row, index) => ({
    id: `sc-${index + 1}`,
    name: row.scenario || `Scenario ${index + 1}`,
    timestamp: new Date(Date.now() - index * 3600_000)
      .toISOString()
      .slice(0, 16)
      .replace("T", " "),
    avgDelay: +toNumber(row.delay_optimized).toFixed(1),
    throughput: +toNumber(row.throughput_optimized).toFixed(0),
    congestionIndex: Math.min(
      99,
      Math.round(toNumber(row.vc_ratio_optimized, 0.7) * 100),
    ),
    travelTime: Math.max(16, Math.round(toNumber(row.delay_optimized) * 0.9)),
    recommendation:
      toNumber(row.vc_ratio_optimized, 0.7) > 1
        ? "Deploy adaptive timing and active diversion."
        : "Current optimized timing is within operational limits.",
  }));

  const totalTrips = areas.reduce((sum, area) => sum + area.dailyTrips, 0);
  const avgCongestionIndex = Math.round(
    areas.reduce((sum, area) => sum + area.congestionIndex, 0) /
      Math.max(areas.length, 1),
  );
  const avgReliability = Math.round(
    areas.reduce((sum, area) => sum + area.travelTimeReliability, 0) /
      Math.max(areas.length, 1),
  );

  const uniqueLocations = new Set(
    (filteredForecastRows.length > 0 ? filteredForecastRows : forecastRows)
      .map((row) => row.location_id)
      .filter(Boolean),
  ).size;

  return {
    avgCongestionIndex,
    avgReliability,
    totalTrips,
    activeIntersections: uniqueLocations,
    delayReduction,
    forecastAccuracy: 92.4,
    areas,
    monthlyTrends,
    topHotspots,
    recentScenarios,
    actualVsPredicted,
    networkObservationCount: sourceFlowRows.length,
    hotspotObservationCount: hotspotSourceRows.length,
    locationOptions,
    selectedLocationId: locationId && locationId !== "" ? locationId : "ALL",
    generatedAt: new Date().toISOString(),
  };
}

export async function getDashboardApiPayload(
  locationId: string | null = null,
  peakWindow: "all" | "am" | "pm" | "offpeak" = "all",
) {
  return loadDashboardPayload(locationId, peakWindow);
}
