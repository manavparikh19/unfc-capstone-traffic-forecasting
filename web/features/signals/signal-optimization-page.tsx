"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import {
  CheckCircle,
  Signal,
  TrendingDown,
  Download,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  getSignalOptData,
  type SignalOptResponse,
} from "@/lib/api";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const peakOptions = [
  { label: "All", value: "all" as const },
  { label: "AM Peak", value: "am" as const },
  { label: "PM Peak", value: "pm" as const },
  { label: "Off-Peak", value: "offpeak" as const },
];

export function SignalOptimizationPage() {
  const [locations, setLocations] = useState<
    Array<{ locationId: string; label: string }>
  >([]);
  const [selectedLocationId, setSelectedLocationId] = useState("ALL");
  const [selectedPeakWindow, setSelectedPeakWindow] =
    useState<(typeof peakOptions)[number]["value"]>("all");
  const [refreshTick, setRefreshTick] = useState(0);
  const [signalData, setSignalData] = useState<SignalOptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const payload = await getSignalOptData({
          locationId:
            selectedLocationId === "ALL" ? undefined : selectedLocationId,
          peakWindow: selectedPeakWindow,
        });
        setLocations(payload.locationOptions ?? []);
        setSignalData(payload);
        setErrorMessage(null);
      } catch {
        setErrorMessage(
          "Live optimization service is unavailable. Displaying degraded state.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedLocationId, selectedPeakWindow, refreshTick]);

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

  const metrics = signalData?.metrics ?? [];
  const phases = signalData?.timingPhases ?? [];
  const approachDelay = signalData?.delayByApproach ?? [];
  const vcSeries = signalData?.vcRatio ?? [];
  const cycleBaseline = signalData?.cycleLength.baseline ?? 0;
  const cycleOptimized = signalData?.cycleLength.optimized ?? 0;
  const improvementRate = signalData?.improvementRate ?? 0;
  const corridor = signalData?.corridor ?? "Reference corridor";
  const observationCount = signalData?.observationCount ?? 0;
  const selectedLocationLabel =
    locations.find((option) => option.locationId === selectedLocationId)?.label ??
    (selectedLocationId === "ALL" ? "All Locations" : selectedLocationId);
  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const filteredLocationOptions = useMemo(() => {
    if (!normalizedLocationQuery) {
      return locations.slice(0, 120);
    }
    return locations
      .filter((option) =>
        option.label.toLowerCase().includes(normalizedLocationQuery),
      )
      .slice(0, 120);
  }, [locations, normalizedLocationQuery]);

  const delayMetric = metrics.find((m) => m.label === "Average Delay");
  const throughputMetric = metrics.find((m) => m.label === "Throughput");
  const queueMetric = metrics.find((m) => m.label === "Queue Length");

  const oversaturatedBefore = vcSeries.filter((point) => point.baseline > 1).length;
  const oversaturatedAfter = vcSeries.filter((point) => point.optimized > 1).length;

  const dynamicTags = useMemo(() => {
    const throughputGain = throughputMetric
      ? ((throughputMetric.optimized - throughputMetric.baseline) /
          Math.max(throughputMetric.baseline, 1)) *
        100
      : 0;
    const queueReduction = queueMetric
      ? ((queueMetric.baseline - queueMetric.optimized) /
          Math.max(queueMetric.baseline, 1)) *
        100
      : 0;

    return [
      `${Math.abs(improvementRate).toFixed(1)}% less delay`,
      `${throughputGain.toFixed(1)}% more throughput`,
      `${queueReduction.toFixed(1)}% shorter queues`,
      `${Math.max(oversaturatedBefore - oversaturatedAfter, 0)} fewer oversaturated periods`,
    ];
  }, [improvementRate, throughputMetric, queueMetric, oversaturatedBefore, oversaturatedAfter]);

  function triggerRefresh() {
    setRefreshTick((v) => v + 1);
  }

  function handleExport() {
    if (!signalData) return;
    const payload = {
      exported_at: new Date().toISOString(),
      location_id: selectedLocationId,
      peak_window: selectedPeakWindow,
      observation_count: observationCount,
      data: signalData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signal-optimization-${selectedLocationId}-${selectedPeakWindow}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-8"
      style={sg}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]"
            style={sg}
          >
            Signal Optimization
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span
            className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1"
            style={{ ...mono, background: "#000" }}
          >
            Intersection: {corridor}
          </span>
          <span
            className="text-[10px] uppercase font-bold mt-1 text-slate-500"
            style={mono}
          >
            Mode: {selectedPeakWindow.toUpperCase()} | Obs: {observationCount}
          </span>
        </div>
      </div>

      <div className="brutal-border bg-white p-4 flex flex-wrap items-center gap-4">
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
                Showing {filteredLocationOptions.length} of {locations.length}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {peakOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeakWindow(option.value)}
              className="brutal-border px-3 py-1.5 text-[10px] font-bold uppercase transition-colors"
              style={{
                ...mono,
                background:
                  selectedPeakWindow === option.value ? "#000" : "transparent",
                color: selectedPeakWindow === option.value ? "#fff" : "#000",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={triggerRefresh}
          className="brutal-border px-3 py-1.5 text-[10px] font-black uppercase"
          style={{ ...mono, background: accent, color: "#fff" }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div
          className="brutal-border bg-red-50 px-4 py-3 text-[10px] font-bold uppercase text-red-700"
          style={mono}
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const isInverse = m.label === "Throughput";
          const change = isInverse
            ? ((m.optimized - m.baseline) / Math.max(m.baseline, 1) * 100).toFixed(1)
            : ((m.baseline - m.optimized) / Math.max(m.baseline, 1) * 100).toFixed(1);
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="brutal-border p-5 bg-white brutal-shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <div className="text-[9px] font-bold text-slate-500 uppercase mb-1" style={mono}>{m.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight" style={{ ...sg, color: accent }}>{m.optimized}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase" style={mono}>{m.unit}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase" style={mono}>
                  Baseline: {m.baseline} {m.unit}
                </span>
                <span className="text-[10px] font-black uppercase flex items-center gap-1" style={{ ...mono, color: "#15803d" }}>
                  <TrendingDown className="size-3" />
                  {isInverse ? "+" : "-"}{change}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Phase Timing Plan</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>
            Green time allocation by phase (seconds)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={phases} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
              <XAxis
                dataKey="phase"
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
                label={{ value: "Seconds", angle: -90, position: "insideLeft", style: { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }}
              />
              <Tooltip
                contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
                labelStyle={{ color: accent }}
              />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }} />
              <Bar dataKey="baseline" name="Baseline" fill="#000" fillOpacity={0.15} radius={[2, 2, 0, 0]} maxBarSize={32} stroke="#000" strokeWidth={1} />
              <Bar dataKey="optimized" name="Optimized" fill={accent} radius={[2, 2, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse" style={mono}>
              <thead>
                <tr style={{ borderBottom: "2px solid #000" }}>
                  {["Phase", "Direction", "Baseline (s)", "Optimized (s)", "Change"].map((h) => (
                    <th key={h} className="py-2 px-3 text-[9px] font-bold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[10px] font-bold uppercase">
                {phases.map((p) => (
                  <tr key={p.phase} className="border-b border-black/5">
                    <td className="py-2 px-3 font-black" style={sg}>{p.phase}</td>
                    <td className="py-2 px-3 text-slate-600">{p.direction}</td>
                    <td className="py-2 px-3">{p.baseline}s</td>
                    <td className="py-2 px-3" style={{ color: accent }}>{p.optimized}s</td>
                    <td className="py-2 px-3" style={{ color: p.optimized > p.baseline ? "#15803d" : accent }}>
                      {p.optimized > p.baseline ? "+" : ""}{(p.optimized - p.baseline).toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="brutal-border bg-white p-6">
            <h3 className="text-lg font-black uppercase mb-4" style={sg}>Cycle Length</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="brutal-border p-4 text-center border-dashed">
                <div className="text-[9px] font-bold text-slate-500 uppercase mb-1" style={mono}>Baseline</div>
                <div className="text-4xl font-black tracking-tight" style={sg}>{cycleBaseline}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase" style={mono}>seconds</div>
              </div>
              <div className="brutal-border p-4 text-center" style={{ borderColor: accent }}>
                <div className="text-[9px] font-bold uppercase mb-1" style={{ ...mono, color: accent }}>Optimized</div>
                <div className="text-4xl font-black tracking-tight" style={{ ...sg, color: accent }}>{cycleOptimized}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase" style={mono}>seconds</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 brutal-border border-green-200 flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600 shrink-0" />
              <span className="text-[10px] font-bold text-green-800" style={mono}>
                {(cycleBaseline - cycleOptimized).toFixed(1)}s reduction in cycle length improves responsiveness
              </span>
            </div>
          </div>

          <div className="brutal-border bg-white p-6">
            <h3 className="text-lg font-black uppercase mb-1" style={sg}>Delay by Approach</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-4" style={mono}>Average delay per vehicle (seconds)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={approachDelay} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: "#000", strokeWidth: 2 }}
                />
                <YAxis
                  type="category"
                  dataKey="approach"
                  tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: "#000", strokeWidth: 2 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
                  labelStyle={{ color: accent }}
                />
                <Bar dataKey="baseline" name="Baseline" fill="#000" fillOpacity={0.15} radius={[0, 2, 2, 0]} maxBarSize={16} stroke="#000" strokeWidth={1} />
                <Bar dataKey="optimized" name="Optimized" fill={accent} radius={[0, 2, 2, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="brutal-border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black uppercase" style={sg}>Volume-to-Capacity Ratio</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
              V/C ratio throughout the day - values above 1.0 indicate oversaturation
            </p>
          </div>
          <div className="text-[10px] font-bold px-2 py-0.5 bg-red-50 brutal-border border-red-200" style={mono}>
            Threshold: 1.0
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={vcSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
            />
            <YAxis
              domain={[0.4, 1.2]}
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              label={{ value: "V/C Ratio", angle: -90, position: "insideLeft", style: { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }}
            />
            <Tooltip
              contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
              labelStyle={{ color: accent }}
            />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }} />
            <ReferenceLine y={1.0} stroke={accent} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Capacity", position: "right", style: { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, fill: accent } }} />
            <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#000" strokeWidth={2} dot={{ r: 3, fill: "#000" }} />
            <Line type="monotone" dataKey="optimized" name="Optimized" stroke={accent} strokeWidth={2.5} dot={{ r: 3, fill: accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutal-border p-6 bg-black text-white">
          <div className="flex items-start gap-3">
            <Signal className="size-5 shrink-0 mt-0.5" style={{ color: accent }} />
            <div>
              <h3 className="text-lg font-black uppercase mb-2" style={sg}>Optimization Recommendation</h3>
              <p className="text-sm font-bold leading-relaxed text-white/60" style={mono}>
                For {corridor}, optimization reduces average delay from {delayMetric?.baseline ?? "-"} to {delayMetric?.optimized ?? "-"} sec/veh ({improvementRate.toFixed(1)}%).
                Oversaturated periods (V/C {">"} 1.0) changed from {oversaturatedBefore} to {oversaturatedAfter}.
                Cycle length moved from {cycleBaseline}s to {cycleOptimized}s using {observationCount} observations in scope.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {dynamicTags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-[9px] font-bold uppercase brutal-border" style={{ borderColor: accent, color: accent, ...mono }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="brutal-border p-6 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black uppercase mb-2" style={sg}>Optimization Objective</h3>
            <p className="text-[10px] font-bold leading-relaxed text-slate-600 mb-4" style={mono}>
              Minimize total intersection delay while maintaining acceptable V/C ratios across all approaches.
              Secondary objective: maximize corridor throughput without exceeding queue storage capacity.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 brutal-border text-white py-3 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
              style={{ background: accent, ...sg }}
            >
              <Download className="size-4" /> Export Report
            </button>
            <button
              onClick={triggerRefresh}
              className="flex-1 brutal-border bg-black text-white py-3 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              style={sg}
            >
              {loading ? "Running..." : "Run Simulation"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
