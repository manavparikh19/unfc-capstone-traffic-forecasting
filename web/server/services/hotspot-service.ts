import path from "node:path";

import type { CityArea } from "@/lib/site-config";
import { cityFocusAreas } from "@/lib/site-config";
import type { Hotspot } from "@/features/traffic/data/demo-data";
import { readCsvFile, toNumber } from "@/server/utils/csv";

type HotspotPayload = {
  hotspots: Hotspot[];
  criticalCount: number;
  highCount: number;
  avgSeverity: number;
};

function getDataRoot() {
  return path.resolve(process.cwd(), "..", "data", "processed");
}

function rankSeverity(index: number, total: number): Hotspot["severity"] {
  if (index < Math.max(2, Math.round(total * 0.2))) {
    return "Critical";
  }
  if (index < Math.max(5, Math.round(total * 0.55))) {
    return "High";
  }
  return "Medium";
}

function trendByScore(score: number): Hotspot["trend"] {
  if (score >= 80) return "rising";
  if (score <= 62) return "falling";
  return "stable";
}

function coordinateFromIndex(index: number) {
  const cols = 4;
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: 22 + col * 18 + (row % 2 ? 4 : 0),
    y: 26 + row * 16,
  };
}

async function loadHotspotPayload(): Promise<HotspotPayload> {
  const rows = await readCsvFile(
    path.join(getDataRoot(), "location_signal_timing_improvement.csv"),
  );

  const ranked = rows
    .map((row) => {
      const baselineDelay = toNumber(row.baseline_delay_sec);
      const queuePressure = toNumber(row.baseline_queue_pressure);
      const improvementPotential = toNumber(row.delay_reduction_sec);
      const throughputGain = toNumber(row.throughput_gain);

      // Weighted severity score on a 0-100 scale using delay and queue stress.
      const rawScore = baselineDelay * 2.2 + queuePressure * 0.06 + throughputGain * 0.03;
      return {
        row,
        score: Math.min(99, Math.max(40, Math.round(rawScore))),
        baselineDelay,
        queuePressure,
        improvementPotential,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);

  const hotspots: Hotspot[] = ranked.map((item, index) => ({
    id: item.row.location_id || `ht-${index + 1}`,
    name: item.row.location_name || item.row.location_id || `Location ${index + 1}`,
    area: cityFocusAreas[index % cityFocusAreas.length] as CityArea,
    severity: rankSeverity(index, ranked.length),
    congestionScore: item.score,
    averageDelay: +item.baselineDelay.toFixed(1),
    queuePressure: Math.round(item.queuePressure),
    improvementPotential: Math.max(0, Math.round(item.improvementPotential)),
    trend: trendByScore(item.score),
    coordinates: coordinateFromIndex(index),
  }));

  return {
    hotspots,
    criticalCount: hotspots.filter((h) => h.severity === "Critical").length,
    highCount: hotspots.filter((h) => h.severity === "High").length,
    avgSeverity: +(
      hotspots.reduce((sum, hotspot) => sum + hotspot.congestionScore, 0) /
      Math.max(hotspots.length, 1)
    ).toFixed(1),
  };
}

export async function getHotspotApiPayload() {
  return loadHotspotPayload();
}
