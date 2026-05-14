import path from "node:path";

import { getProcessedDataRoot } from "@/server/utils/data-root";
import { readCsvFile, toNumber } from "@/server/utils/csv";

type MethodologyMetric = {
  metric: string;
  value: string;
  desc: string;
};

type MethodologyModel = {
  name: string;
  mae: number;
  rmse: number;
};

export type MethodologySummary = {
  dataset: {
    dataPoints: number;
    intersections: number;
    timeSpan: string;
    resolution: string;
  };
  metrics: MethodologyMetric[];
  models: MethodologyModel[];
};

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export async function getMethodologySummary(): Promise<MethodologySummary> {
  const [flowRowsRaw, modelRowsRaw, forecastRowsRaw, impactRowsRaw] =
    await Promise.all([
      readCsvFile(path.join(getProcessedDataRoot(), "traffic_flow_metrics_2015_2019.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "forecast_model_results.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "traffic_demand_forecasts.csv")),
      readCsvFile(path.join(getProcessedDataRoot(), "signal_timing_impact_summary.csv")),
    ]);

  const flowRows = flowRowsRaw.filter(
    (row) => row.location_id && row.location_id !== "location_id",
  );
  const modelRows = modelRowsRaw.filter(
    (row) => row.Model && row.Model !== "Model",
  );
  const forecastRows = forecastRowsRaw.filter(
    (row) =>
      row.location_id &&
      row.location_id !== "location_id" &&
      row.forecast_timestamp &&
      row.forecast_timestamp !== "forecast_timestamp",
  );
  const impactRows = impactRowsRaw.filter(
    (row) => row.scenario && row.scenario !== "scenario",
  );

  const intersections = new Set(
    flowRows
      .map((row) => (row.location_id || row.centreline_id || row.location_name || "").trim())
      .filter(Boolean),
  ).size;

  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = Number.NEGATIVE_INFINITY;
  for (const row of flowRows) {
    const year = Number(row.year);
    if (!Number.isFinite(year)) continue;
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
  }
  if (!Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
    minYear = 0;
    maxYear = 0;
  }
  const timeSpan =
    minYear > 0 && maxYear > 0
      ? (minYear === maxYear ? String(minYear) : `${minYear}-${maxYear}`)
      : "N/A";

  const models: MethodologyModel[] = modelRows
    .map((row) => ({
      name: row.Model,
      rmse: toNumber(row.RMSE),
      mae: toNumber(row.MAE),
    }))
    .filter((row) => row.name.length > 0)
    .sort((a, b) => a.mae - b.mae);

  const best = models[0] ?? { name: "N/A", mae: 0, rmse: 0 };

  let mape = 0;
  let mapeCount = 0;
  let sse = 0;
  let actualMean = 0;
  if (forecastRows.length > 0) {
    const actuals = forecastRows.map((row) => toNumber(row.actual_volume));
    actualMean = actuals.reduce((sum, value) => sum + value, 0) / actuals.length;
    for (const row of forecastRows) {
      const actual = toNumber(row.actual_volume);
      const predicted = toNumber(row.predicted_volume);
      if (actual > 0) {
        mape += Math.abs((actual - predicted) / actual);
        mapeCount += 1;
      }
      sse += (actual - predicted) ** 2;
    }
  }
  const finalMape = mapeCount > 0 ? (mape / mapeCount) * 100 : 0;
  const sst = forecastRows.reduce((sum, row) => {
    const actual = toNumber(row.actual_volume);
    return sum + (actual - actualMean) ** 2;
  }, 0);
  const r2 = sst > 0 ? 1 - sse / sst : 0;

  const peakImpact =
    impactRows.find((row) => row.scenario === "Peak Demand") ?? impactRows[0];
  const delayReduction = toNumber(peakImpact?.delay_reduction_percent);
  const throughputImprovement = toNumber(peakImpact?.throughput_increase_percent);

  return {
    dataset: {
      dataPoints: forecastRows.length,
      intersections,
      timeSpan,
      resolution: "1-hour intervals",
    },
    metrics: [
      {
        metric: "MAE (Mean Absolute Error)",
        value: `${best.mae.toFixed(1)} veh/hr`,
        desc: "Best model absolute forecast error from benchmark export.",
      },
      {
        metric: "RMSE (Root Mean Squared Error)",
        value: `${best.rmse.toFixed(1)} veh/hr`,
        desc: "Best model squared-error metric from benchmark export.",
      },
      {
        metric: "MAPE (Mean Abs % Error)",
        value: `${finalMape.toFixed(1)}%`,
        desc: "Computed over forecast snapshot actual vs predicted rows.",
      },
      {
        metric: "R² (Coefficient of Determination)",
        value: `${r2.toFixed(3)}`,
        desc: "Calculated from actual/predicted traffic demand forecasts.",
      },
      {
        metric: "Delay Reduction",
        value: `${delayReduction.toFixed(1)}%`,
        desc: "Peak-demand optimized delay reduction vs baseline.",
      },
      {
        metric: "Throughput Improvement",
        value: `${throughputImprovement.toFixed(1)}%`,
        desc: "Peak-demand throughput increase vs baseline timing.",
      },
    ],
    models,
  };
}

export function formatDatasetCards(summary: MethodologySummary) {
  return [
    { label: "Data Points", value: formatCompact(summary.dataset.dataPoints) },
    { label: "Intersections", value: formatCompact(summary.dataset.intersections) },
    { label: "Time Span", value: summary.dataset.timeSpan },
    { label: "Resolution", value: summary.dataset.resolution },
  ];
}
