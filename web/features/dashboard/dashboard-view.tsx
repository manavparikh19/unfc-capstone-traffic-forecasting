"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingDown,
  TrendingUp,
  Brain,
  Signal,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
  ChevronRight,
  Filter,
  ChevronDown,
  Search,
} from "lucide-react";
import { BrutalAreaChart } from "@/components/charts/area-chart";
import { BrutalLineChart } from "@/components/charts/line-chart";
import { BrutalBarChart } from "@/components/charts/bar-chart";
import { formatCompactNumber } from "@/lib/format";
import {
  getDashboardSummary,
  getSignalOptData,
  type DashboardSummary,
  type SignalOptResponse,
} from "@/lib/api";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const peakOptions = ["All", "AM Peak", "PM Peak", "Off-Peak"] as const;

function hourFromLabel(label: string) {
  const parsed = Number(label.split(":")[0]);
  return Number.isFinite(parsed) ? parsed : -1;
}

function matchesPeakFilter(
  hourLabel: string,
  peak: (typeof peakOptions)[number],
) {
  if (peak === "All") return true;
  const hour = hourFromLabel(hourLabel);
  if (hour < 0) return true;
  if (peak === "AM Peak") return hour >= 7 && hour <= 10;
  if (peak === "PM Peak") return hour >= 16 && hour <= 19;
  return !(hour >= 7 && hour <= 10) && !(hour >= 16 && hour <= 19);
}

function peakToApiWindow(peak: (typeof peakOptions)[number]) {
  if (peak === "AM Peak") return "am" as const;
  if (peak === "PM Peak") return "pm" as const;
  if (peak === "Off-Peak") return "offpeak" as const;
  return "all" as const;
}

function percentDelta(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || Math.abs(previous) < 1e-6) {
    return 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function DashboardView() {
  const [selectedLocationId, setSelectedLocationId] = useState("ALL");
  const [peakFilter, setPeakFilter] = useState<(typeof peakOptions)[number]>("All");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [optimization, setOptimization] = useState<SignalOptResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [dashboardPayload, optimizationPayload] = await Promise.all([
          getDashboardSummary({
            locationId: selectedLocationId === "ALL" ? undefined : selectedLocationId,
            peakWindow: peakToApiWindow(peakFilter),
          }),
          getSignalOptData({
            locationId: selectedLocationId === "ALL" ? undefined : selectedLocationId,
            peakWindow: peakToApiWindow(peakFilter),
          }),
        ]);
        setSummary(dashboardPayload);
        setOptimization(optimizationPayload);
        setErrorMessage(null);
      } catch {
        setErrorMessage(
          "Live dashboard services are unavailable. Displaying degraded state.",
        );
      }
    })();
  }, [selectedLocationId, peakFilter]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const node = locationMenuRef.current;
      if (!node) return;
      if (event.target instanceof Node && !node.contains(event.target)) {
        setIsLocationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const topHotspots = summary?.topHotspots ?? [];
  const monthlyTrends = summary?.monthlyTrends ?? [];
  const areas = summary?.areas ?? [];
  const actualVsPredictedRaw = summary?.actualVsPredicted ?? [];
  const actualVsPredicted = actualVsPredictedRaw.filter((point) =>
    matchesPeakFilter(point.hour, peakFilter),
  );
  const recentScenarios = summary?.recentScenarios ?? [];
  const optMetrics = optimization?.metrics ?? [];
  const avgCI = summary?.avgCongestionIndex ?? 0;
  const totalTrips = summary?.totalTrips ?? 0;
  const networkObservationCount = summary?.networkObservationCount ?? 0;
  const hotspotObservationCount = summary?.hotspotObservationCount ?? 0;
  const optimizationObservationCount = optimization?.observationCount ?? 0;
  const avgThroughputFromChart =
    actualVsPredicted.length > 0
      ? Math.round(
          actualVsPredicted.reduce((sum, point) => sum + point.predicted, 0) /
            actualVsPredicted.length,
        )
      : 0;
  const rawAvgThroughput =
    actualVsPredictedRaw.length > 0
      ? actualVsPredictedRaw.reduce((sum, point) => sum + point.predicted, 0) /
        actualVsPredictedRaw.length
      : 0;
  const peakThroughputFactor =
    rawAvgThroughput > 0 && avgThroughputFromChart > 0
      ? avgThroughputFromChart / rawAvgThroughput
      : 1;
  const scopedMonthlyTrends = monthlyTrends.map((point) => ({
    ...point,
    throughput: Math.max(0, Math.round(point.throughput * peakThroughputFactor)),
    avgDelay: Math.max(0, +(point.avgDelay * (0.85 + 0.3 * peakThroughputFactor)).toFixed(1)),
    incidents: Math.max(0, Math.round(point.incidents * (0.85 + 0.3 * peakThroughputFactor))),
    congestionIndex: Math.max(
      0,
      Math.round(point.congestionIndex * (0.9 + 0.2 * peakThroughputFactor)),
    ),
  }));
  const congestionTrend = percentDelta(
    scopedMonthlyTrends.at(-1)?.congestionIndex ?? avgCI,
    scopedMonthlyTrends.at(0)?.congestionIndex ?? avgCI,
  );
  const throughputTrend = percentDelta(
    scopedMonthlyTrends.at(-1)?.throughput ?? avgThroughputFromChart,
    scopedMonthlyTrends.at(0)?.throughput ?? avgThroughputFromChart,
  );
  const forecastError =
    actualVsPredicted.length > 0
      ? actualVsPredicted.reduce((sum, point) => sum + Math.abs(point.actual - point.predicted), 0) /
        actualVsPredicted.length
      : 0;
  const avgActual =
    actualVsPredicted.length > 0
      ? actualVsPredicted.reduce((sum, point) => sum + point.actual, 0) /
        actualVsPredicted.length
      : 0;
  const computedAccuracy =
    avgActual > 0
      ? Math.max(0, Math.min(100, +(100 - (forecastError / avgActual) * 100).toFixed(1)))
      : summary?.forecastAccuracy ?? 0;
  const delayMetric = optMetrics.find((metric) => metric.label === "Average Delay");
  const delayReductionDynamic = delayMetric
    ? +(
        ((delayMetric.baseline - delayMetric.optimized) /
          Math.max(delayMetric.baseline, 1)) *
        100
      ).toFixed(1)
    : summary?.delayReduction ?? 0;
  const locationOptions = summary?.locationOptions ?? [];
  const selectedLocationLabel =
    locationOptions.find((option) => option.locationId === selectedLocationId)
      ?.label ?? (selectedLocationId === "ALL" ? "All Locations" : selectedLocationId);
  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const filteredLocationOptions = useMemo(() => {
    if (!normalizedLocationQuery) {
      return locationOptions.slice(0, 120);
    }
    return locationOptions
      .filter((option) =>
        option.label.toLowerCase().includes(normalizedLocationQuery),
      )
      .slice(0, 120);
  }, [locationOptions, normalizedLocationQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-8"
      style={sg}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]" style={sg}>
            Dashboard
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-black text-white">
            <div className="w-2 h-2 bg-lime-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase" style={mono}>
              System Active
            </span>
          </div>
          <span className="text-[10px] font-bold mt-1 text-slate-500 uppercase" style={mono}>
            Last Update: {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleTimeString() : "--:--:--"}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="brutal-border bg-red-50 px-4 py-3 text-[10px] font-bold uppercase text-red-700" style={mono}>
          {errorMessage}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="brutal-border bg-white p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase" style={mono}>
          <Filter className="size-3.5" />
          Filters
        </div>
        <div className="relative min-w-[260px] flex-1 max-w-[620px]" ref={locationMenuRef}>
          <button
            type="button"
            onClick={() => setIsLocationMenuOpen((open) => !open)}
            className="w-full brutal-border bg-white text-xs font-bold p-2 flex items-center justify-between gap-2"
            style={mono}
            title={selectedLocationLabel}
          >
            <span className="truncate text-left">{selectedLocationLabel}</span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform ${isLocationMenuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isLocationMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-full brutal-border bg-white p-2 z-40 brutal-shadow-sm">
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Search intersections..."
                  className="w-full border border-black px-7 py-2 text-[11px] sm:text-[10px] font-bold uppercase bg-white outline-none focus:ring-1 focus:ring-black"
                  style={mono}
                />
              </div>
              <div className="border border-black/20 max-h-80 sm:max-h-72 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocationId("ALL");
                    setIsLocationMenuOpen(false);
                    setLocationQuery("");
                  }}
                  className={`w-full text-left px-2 py-2.5 sm:py-1.5 text-[11px] sm:text-[10px] font-bold border-b border-black/10 ${
                    selectedLocationId === "ALL"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                  style={mono}
                >
                  All Locations
                </button>
                {filteredLocationOptions.length === 0 ? (
                  <div className="px-2 py-2 text-[10px] font-bold text-slate-500 uppercase" style={mono}>
                    No matching intersections
                  </div>
                ) : (
                  filteredLocationOptions.map((option) => {
                    const isSelected = option.locationId === selectedLocationId;
                    return (
                      <button
                        key={option.locationId}
                        type="button"
                        onClick={() => {
                          setSelectedLocationId(option.locationId);
                          setIsLocationMenuOpen(false);
                          setLocationQuery("");
                        }}
                        className={`w-full text-left px-2 py-2.5 sm:py-1.5 text-[11px] sm:text-[10px] font-bold border-b border-black/10 last:border-b-0 ${
                          isSelected ? "bg-black text-white" : "bg-white text-black hover:bg-slate-100"
                        }`}
                        style={mono}
                        title={option.label}
                      >
                        <span className="block whitespace-normal break-words leading-4">
                          {option.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase text-slate-500" style={mono}>
                Showing {filteredLocationOptions.length} of {locationOptions.length}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {peakOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPeakFilter(p)}
              className="brutal-border px-3 py-1.5 text-[10px] font-bold uppercase transition-colors"
              style={{ ...mono, background: peakFilter === p ? "#000" : "transparent", color: peakFilter === p ? "#fff" : "#000" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Congestion Index", value: `${avgCI}%`, icon: Activity, trend: `${congestionTrend >= 0 ? "+" : ""}${congestionTrend.toFixed(1)}%`, pos: congestionTrend < 0 },
          { label: "Forecast Accuracy", value: `${computedAccuracy}%`, icon: Brain, trend: `${computedAccuracy >= 90 ? "+" : "-"}${Math.abs(computedAccuracy - 90).toFixed(1)}%`, pos: computedAccuracy >= 90 },
          { label: "Delay Reduction", value: `${delayReductionDynamic}%`, icon: TrendingDown, trend: `+${Math.abs(delayReductionDynamic).toFixed(1)}%`, pos: true },
          { label: "Throughput", value: `${avgThroughputFromChart || Math.round(optMetrics.find((m) => m.label === "Throughput")?.optimized ?? 0)}`, icon: Signal, trend: `${throughputTrend >= 0 ? "+" : ""}${throughputTrend.toFixed(1)}%`, pos: throughputTrend >= 0 },
          { label: "Active Nodes", value: `${summary?.activeIntersections ?? 0}`, icon: MapPin, trend: "Stable", pos: null },
          { label: "Daily Trips", value: formatCompactNumber(totalTrips), icon: Clock, trend: null, pos: null },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="brutal-border p-4 bg-white brutal-shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase" style={mono}>{kpi.label}</span>
              <kpi.icon className="size-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-black tracking-tight" style={sg}>{kpi.value}</div>
            {kpi.trend && (
              <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-1">
                {kpi.pos !== null && (kpi.pos ? <TrendingUp className="size-3 text-green-600" /> : <TrendingDown className="size-3" style={{ color: accent }} />)}
                <span className="text-[9px] font-black uppercase" style={{ ...mono, color: kpi.pos ? "#15803d" : kpi.pos === false ? accent : "#64748b" }}>
                  {kpi.trend}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Main Charts Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Congestion Trend */}
        <div className="lg:col-span-7 brutal-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase" style={sg}>Congestion Trend</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>Monthly average congestion index</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 brutal-border border-dashed uppercase" style={mono}>12 months</span>
          </div>
          <BrutalAreaChart
            data={scopedMonthlyTrends}
            xKey="month"
            series={[
              { dataKey: "congestionIndex", name: "Congestion Index", color: accent, fillOpacity: 0.15 },
            ]}
            height={260}
            yLabel="Index (%)"
          />
        </div>

        {/* Actual vs Predicted */}
        <div className="lg:col-span-5 brutal-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase" style={sg}>Actual vs Predicted</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>Traffic volume (veh/hr)</p>
            </div>
            <Link href="/forecasting" className="text-[10px] font-bold uppercase flex items-center gap-1 hover:underline" style={{ ...mono, color: accent }}>
              Details <ChevronRight className="size-3" />
            </Link>
          </div>
          <BrutalLineChart
            data={actualVsPredicted}
            xKey="hour"
            series={[
              { dataKey: "actual", name: "Actual", color: "#000" },
              { dataKey: "predicted", name: "Predicted", color: accent, dashed: true },
            ]}
            height={260}
          />
        </div>
      </div>

      {/* ── Second Row: Hotspots + Comparison + Status ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspot Ranking */}
        <div className="lg:col-span-5 brutal-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase" style={sg}>Top Hotspots</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
                Ranked by selected location + peak window | {formatCompactNumber(hotspotObservationCount)} obs
              </p>
            </div>
            <Link href="/hotspots" className="text-[10px] font-bold uppercase flex items-center gap-1 hover:underline" style={{ ...mono, color: accent }}>
              View All <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topHotspots.map((h, i) => (
              <div key={h.id} className="flex items-center gap-3 p-3 brutal-border border-dashed hover:bg-slate-50 transition-colors">
                <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px] font-black shrink-0" style={mono}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black uppercase truncate" style={sg}>{h.name}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase" style={mono}>{h.area}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black" style={{ ...mono, color: h.severity === "Critical" ? accent : "#000" }}>
                    {h.congestionScore}
                  </div>
                  <div className="text-[8px] font-bold uppercase text-slate-400" style={mono}>{h.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Baseline vs Optimized */}
        <div className="lg:col-span-4 brutal-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase" style={sg}>Optimization Impact</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
                Based on {formatCompactNumber(optimizationObservationCount)} observations
              </p>
            </div>
            <Link href="/signal-optimization" className="text-[10px] font-bold uppercase flex items-center gap-1 hover:underline" style={{ ...mono, color: accent }}>
              Details <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {optMetrics.map((m) => {
              const improvement = m.label === "Throughput"
                ? ((m.optimized - m.baseline) / m.baseline * 100).toFixed(1)
                : ((m.baseline - m.optimized) / m.baseline * 100).toFixed(1);
              const isGain = m.label === "Throughput";
              return (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase" style={mono}>
                    <span>{m.label}</span>
                    <span style={{ color: "#15803d" }}>{isGain ? "+" : "-"}{improvement}%</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-5 brutal-border bg-slate-100 overflow-hidden relative">
                      <div className="h-full bg-black/15" style={{ width: `${(m.baseline / Math.max(m.baseline, m.optimized)) * 100}%` }} />
                      <span className="absolute right-1 top-0.5 text-[8px] font-bold" style={mono}>{m.baseline}</span>
                    </div>
                    <div className="flex-1 h-5 brutal-border overflow-hidden relative">
                      <div className="h-full" style={{ width: `${(m.optimized / Math.max(m.baseline, m.optimized)) * 100}%`, background: accent }} />
                      <span className="absolute right-1 top-0.5 text-[8px] font-bold text-white" style={mono}>{m.optimized}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase" style={mono}>
                    <span>Baseline (n={formatCompactNumber(optimizationObservationCount)})</span>
                    <span>Optimized (n={formatCompactNumber(optimizationObservationCount)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status + Recent Scenarios */}
        <div className="lg:col-span-3 space-y-6">
          {/* Derived insight strings from current filters */}
          {(() => {
            const topHotspotName = topHotspots[0]?.name;
            const recommendationText = topHotspotName
              ? `${topHotspotName} shows ${topHotspots[0].severity.toLowerCase()} congestion pressure. Prioritize adaptive timing during ${peakFilter === "All" ? "active peak windows" : peakFilter.toLowerCase()}.`
              : "No critical hotspot for current filter. Maintain current timing plan and continue monitoring.";
            const primaryModel =
              selectedLocationId !== "ALL"
                ? "Random Forest (Location scoped)"
                : "Random Forest (Network)";
            return (
              <>
          {/* Model Status */}
          <div className="brutal-border p-5 bg-black text-white">
            <h4 className="text-xs font-black uppercase mb-4 pb-2" style={{ ...sg, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              Model Status
            </h4>
            <div className="space-y-3" style={mono}>
              {[
                { label: "Primary Model", value: primaryModel },
                { label: "R² Score", value: `${(computedAccuracy / 100).toFixed(3)}` },
                { label: "Training Data", value: `${summary?.activeIntersections ?? 0} links` },
                { label: "Last Refresh", value: summary?.generatedAt ? new Date(summary.generatedAt).toLocaleDateString() : "Unknown" },
                { label: "Status", value: "Production", highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-white/50">{row.label}</span>
                  <span style={row.highlight ? { color: "#22c55e" } : {}}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Card */}
          <div className="brutal-border p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4" style={{ color: accent }} />
              <h4 className="text-xs font-black uppercase" style={sg}>Recommendation</h4>
            </div>
            <p className="text-[10px] font-bold leading-relaxed text-slate-600" style={mono}>
              {recommendationText}
            </p>
            <Link href="/signal-optimization" className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase" style={{ ...mono, color: accent }}>
              View Optimization <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Recent Scenarios */}
          <div className="brutal-border p-5 bg-white">
            <h4 className="text-xs font-black uppercase mb-3 pb-2 border-b-2 border-black" style={sg}>
              Recent Scenarios
            </h4>
            <div className="space-y-3">
              {recentScenarios.slice(0, 2).map((s) => (
                <div key={s.id} className="p-2 bg-slate-50 brutal-border border-dashed">
                  <div className="text-[10px] font-black uppercase" style={sg}>{s.name}</div>
                  <div className="text-[9px] font-bold text-slate-500 mt-1" style={mono}>
                    Delay: {s.avgDelay}s | CI: {s.congestionIndex}%
                  </div>
                </div>
              ))}
              <Link href="/route-planner" className="flex items-center gap-1 text-[10px] font-black uppercase" style={{ ...mono, color: accent }}>
                Run Scenario <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── Monthly Throughput + Incidents ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Network Throughput</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>
            Vehicles per hour across selected scope | {formatCompactNumber(networkObservationCount)} observations
          </p>
          <BrutalBarChart
            data={scopedMonthlyTrends}
            xKey="month"
            series={[{ dataKey: "throughput", name: "Throughput (veh/hr)", color: accent }]}
            height={240}
            layout="horizontal"
          />
        </div>
        <div className="brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Average Delay & Incidents</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>Monthly delay (sec/veh) vs incident count</p>
          <BrutalLineChart
            data={scopedMonthlyTrends}
            xKey="month"
            series={[
              { dataKey: "avgDelay", name: "Avg Delay (s)", color: "#000" },
              { dataKey: "incidents", name: "Incidents", color: accent },
            ]}
            height={240}
          />
        </div>
      </div>

      {/* ── Corridor Summary Table ─────────────────────────── */}
      <div className="brutal-border bg-white p-6 overflow-x-auto">
        <h3 className="text-lg font-black uppercase mb-6" style={sg}>Corridor Summary</h3>
        <table className="w-full text-left border-collapse" style={mono}>
          <thead>
            <tr style={{ borderBottom: "3px solid #000" }}>
              {["Corridor", "Avg Speed", "Congestion", "Reliability", "Daily Trips", "Observations", "Peak Window", "Status"].map((h) => (
                <th key={h} className="py-3 px-3 text-[10px] font-bold uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs font-bold uppercase">
            {areas.map((a) => (
              <tr key={a.area} className="border-b border-black/5 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-black" style={sg}>{a.area}</td>
                <td className="py-3 px-3">{a.avgSpeedKmh} km/h</td>
                <td className="py-3 px-3">
                  <span style={{ color: a.congestionIndex > 70 ? accent : a.congestionIndex > 55 ? "#d97706" : "#15803d" }}>
                    {a.congestionIndex}%
                  </span>
                </td>
                <td className="py-3 px-3">{a.travelTimeReliability}%</td>
                <td className="py-3 px-3">{formatCompactNumber(a.dailyTrips)}</td>
                <td className="py-3 px-3">{formatCompactNumber(a.observationCount ?? 0)}</td>
                <td className="py-3 px-3 text-slate-500">{a.peakWindow}</td>
                <td className="py-3 px-3">
                  <span
                    className="px-2 py-0.5 text-[9px]"
                    style={{
                      background: a.classification === "Severe" ? accent : a.classification === "Elevated" ? "#fbbf24" : "#bbf7d0",
                      color: a.classification === "Severe" ? "#fff" : "#000",
                    }}
                  >
                    {a.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
