import {
  corridorForecast,
  dashboardMetrics,
  forecastModels,
  hotspots,
  signalMetrics,
  signalTrend,
} from "@/features/traffic/data/demo-data";
import type { CityArea } from "@/lib/site-config";

export function getDashboardSnapshot(area?: CityArea) {
  const activeArea =
    dashboardMetrics.find((entry) => entry.area === area) ??
    dashboardMetrics[0];

  const networkAverages = {
    averageCongestionIndex: Math.round(
      dashboardMetrics.reduce((sum, item) => sum + item.congestionIndex, 0) /
        dashboardMetrics.length,
    ),
    averageReliability: Math.round(
      dashboardMetrics.reduce(
        (sum, item) => sum + item.travelTimeReliability,
        0,
      ) / dashboardMetrics.length,
    ),
    totalTrips: dashboardMetrics.reduce(
      (sum, item) => sum + item.dailyTrips,
      0,
    ),
  };

  return {
    activeArea,
    networkAverages,
    locations: dashboardMetrics,
  };
}

export function getForecastSnapshot() {
  const rankedModels = [...forecastModels].sort((a, b) => a.mae - b.mae);
  return {
    demandSeries: corridorForecast,
    models: rankedModels,
    bestModel: rankedModels[0],
  };
}

export function getSignalOptimizationSnapshot() {
  return {
    metrics: signalMetrics,
    trend: signalTrend,
    improvementRate: 37,
    corridor: "Downtown Core to Harbourfront",
  };
}

export function getHotspotSnapshot() {
  return {
    hotspots: [...hotspots].sort(
      (a, b) => b.congestionScore - a.congestionScore,
    ),
    criticalCount: hotspots.filter((item) => item.severity === "Critical")
      .length,
  };
}
