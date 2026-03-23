import path from "node:path";

import type { ScenarioInput, ScenarioOutput } from "@/lib/api";
import { readCsvFile, toNumber } from "@/server/utils/csv";

type ScenarioHistoryItem = {
  id: string;
  name: string;
  timestamp: string;
  avgDelay: number;
  throughput: number;
  congestionIndex: number;
  travelTime: number;
  recommendation: string;
};

type ScenarioResponse = {
  result: ScenarioOutput;
  baseline: ScenarioOutput;
  history: ScenarioHistoryItem[];
};

function getDataRoot() {
  return path.resolve(process.cwd(), "..", "data", "processed");
}

function demandScenarioName(level: ScenarioInput["demandLevel"]) {
  if (level === "low") return "Off-Peak Demand";
  if (level === "normal") return "Normal Demand";
  return "Peak Demand";
}

function weatherDelayFactor(weather: ScenarioInput["weatherCondition"]) {
  if (weather === "snow") return 1.22;
  if (weather === "rain") return 1.1;
  return 1;
}

function weatherThroughputFactor(weather: ScenarioInput["weatherCondition"]) {
  if (weather === "snow") return 0.84;
  if (weather === "rain") return 0.92;
  return 1;
}

function demandFactor(level: ScenarioInput["demandLevel"]) {
  if (level === "low") return 0.86;
  if (level === "normal") return 1;
  if (level === "high") return 1.16;
  return 1.35;
}

function strategyBlend(strategy: ScenarioInput["timingStrategy"]) {
  if (strategy === "adaptive") return 1;
  if (strategy === "actuated") return 0.65;
  return 0;
}

function recommendationFromDelay(delay: number) {
  if (delay > 38) {
    return "High congestion expected. Deploy adaptive timing and diversion for critical approaches.";
  }
  if (delay > 25) {
    return "Moderate pressure expected. Adaptive timing recommended for peak windows.";
  }
  return "System operating within acceptable parameters. Continue monitoring.";
}

function toScenarioOutput(
  baselineDelay: number,
  baselineThroughput: number,
  baselineVc: number,
  baselineQueue: number,
  delay: number,
  throughput: number,
  vcRatio: number,
  queue: number,
): ScenarioOutput {
  const congestionIndex = Math.max(
    8,
    Math.min(99, Math.round((vcRatio / 1.2) * 100)),
  );
  const baselineCongestion = Math.max(
    8,
    Math.min(99, Math.round((baselineVc / 1.2) * 100)),
  );
  const travelTime = Math.max(8, +(11 + delay * 0.42).toFixed(1));
  const baselineTravelTime = Math.max(8, +(11 + baselineDelay * 0.42).toFixed(1));
  const co2Reduction = +Math.max(
    -20,
    Math.min(40, ((baselineDelay - delay) / Math.max(baselineDelay, 1)) * 100),
  ).toFixed(1);

  return {
    avgDelay: +delay.toFixed(1),
    throughput: +throughput.toFixed(0),
    congestionIndex,
    travelTime,
    queueLength: +queue.toFixed(1),
    co2Reduction,
    recommendation: recommendationFromDelay(delay),
    comparedToBaseline: {
      delayChange: +(((delay - baselineDelay) / Math.max(baselineDelay, 1)) * 100).toFixed(1),
      throughputChange: +(((throughput - baselineThroughput) / Math.max(baselineThroughput, 1)) * 100).toFixed(1),
      congestionChange: +(congestionIndex - baselineCongestion).toFixed(1),
    },
  };
}

async function loadImpactRows() {
  return readCsvFile(path.join(getDataRoot(), "signal_timing_impact_summary.csv"));
}

export async function getScenarioHistory(limit = 6): Promise<ScenarioHistoryItem[]> {
  const rows = await loadImpactRows();
  return rows.slice(0, limit).map((row, index) => {
    const delay = toNumber(row.delay_optimized);
    const throughput = toNumber(row.throughput_optimized);
    const vc = toNumber(row.vc_ratio_optimized, toNumber(row.vc_ratio_baseline, 0.7));
    const congestion = Math.max(8, Math.min(99, Math.round((vc / 1.2) * 100)));
    const timestamp = new Date(Date.now() - index * 45 * 60_000)
      .toISOString()
      .slice(0, 16)
      .replace("T", " ");
    return {
      id: `hist-${index + 1}`,
      name: row.scenario || `Scenario ${index + 1}`,
      timestamp,
      avgDelay: +delay.toFixed(1),
      throughput: +throughput.toFixed(0),
      congestionIndex: congestion,
      travelTime: Math.max(8, +(11 + delay * 0.42).toFixed(1)),
      recommendation: recommendationFromDelay(delay),
    };
  });
}

export async function simulateScenario(input: ScenarioInput): Promise<ScenarioResponse> {
  const rows = await loadImpactRows();
  const byScenario = new Map<string, Record<string, string>>();
  for (const row of rows) {
    const key = row.scenario?.trim();
    if (!key || byScenario.has(key)) continue;
    byScenario.set(key, row);
  }

  const selectedScenario = demandScenarioName(input.demandLevel);
  const selectedRow =
    byScenario.get(selectedScenario) ?? byScenario.get("Normal Demand") ?? rows[0];
  const normalRow = byScenario.get("Normal Demand") ?? rows[0];

  const baseDelayFixed = toNumber(selectedRow.delay_baseline, 20);
  const optDelay = toNumber(selectedRow.delay_optimized, baseDelayFixed * 0.9);
  const baseThroughputFixed = toNumber(selectedRow.throughput_baseline, 1200);
  const optThroughput = toNumber(selectedRow.throughput_optimized, baseThroughputFixed * 1.08);
  const baseQueueFixed = toNumber(selectedRow.queue_baseline, 0);
  const optQueue = toNumber(selectedRow.queue_optimized, baseQueueFixed * 0.5);
  const baseVc = toNumber(selectedRow.vc_ratio_baseline, 0.7);
  const optVc = toNumber(selectedRow.vc_ratio_optimized, baseVc * 0.9);

  const strategyAlpha = strategyBlend(input.timingStrategy);
  const strategyDelay = baseDelayFixed + (optDelay - baseDelayFixed) * strategyAlpha;
  const strategyThroughput =
    baseThroughputFixed + (optThroughput - baseThroughputFixed) * strategyAlpha;
  const strategyQueue = baseQueueFixed + (optQueue - baseQueueFixed) * strategyAlpha;
  const strategyVc = baseVc + (optVc - baseVc) * strategyAlpha;

  const surge = 1 + input.trafficSurge / 100;
  const incidentDelayFactor = input.hasIncident ? 1.28 : 1;
  const incidentThroughputFactor = input.hasIncident ? 0.8 : 1;
  const incidentQueueFactor = input.hasIncident ? 1.35 : 1;
  const weatherD = weatherDelayFactor(input.weatherCondition);
  const weatherT = weatherThroughputFactor(input.weatherCondition);
  const demandD = demandFactor(input.demandLevel);

  const scenarioDelay = strategyDelay * surge * incidentDelayFactor * weatherD * demandD;
  const scenarioThroughput =
    strategyThroughput *
    Math.max(0.45, weatherT * incidentThroughputFactor / Math.max(surge * demandD, 0.1));
  const scenarioQueue = strategyQueue * surge * incidentQueueFactor * weatherD * demandD;
  const scenarioVc = strategyVc * surge * demandD * (input.hasIncident ? 1.06 : 1);

  const baselineDelay = toNumber(normalRow.delay_baseline, 20);
  const baselineThroughput = toNumber(normalRow.throughput_baseline, 1200);
  const baselineQueue = toNumber(normalRow.queue_baseline, 0);
  const baselineVc = toNumber(normalRow.vc_ratio_baseline, 0.7);

  const baseline = toScenarioOutput(
    baselineDelay,
    baselineThroughput,
    baselineVc,
    baselineQueue,
    baselineDelay,
    baselineThroughput,
    baselineVc,
    baselineQueue,
  );

  const result = toScenarioOutput(
    baselineDelay,
    baselineThroughput,
    baselineVc,
    baselineQueue,
    scenarioDelay,
    scenarioThroughput,
    scenarioVc,
    scenarioQueue,
  );

  const history = await getScenarioHistory(6);

  return { result, baseline, history };
}

