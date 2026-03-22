"use client";

import { useState } from "react";
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Zap,
  Cloud,
  AlertTriangle,
  ChevronRight,
  FlaskConical,
  Gauge,
  Timer,
  TrendingDown,
  TrendingUp,
  Clock,
} from "lucide-react";
import { runScenario, type ScenarioInput, type ScenarioOutput } from "@/lib/api";
import { scenarioHistory } from "@/features/traffic/data/demo-data";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const weatherOptions = [
  { value: "clear" as const, label: "Clear", icon: "☀" },
  { value: "rain" as const, label: "Rain", icon: "🌧" },
  { value: "snow" as const, label: "Snow", icon: "❄" },
];

const timingOptions = [
  { value: "fixed" as const, label: "Fixed Time" },
  { value: "adaptive" as const, label: "Adaptive" },
  { value: "actuated" as const, label: "Actuated" },
];

const demandOptions = [
  { value: "low" as const, label: "Low" },
  { value: "normal" as const, label: "Normal" },
  { value: "high" as const, label: "High" },
  { value: "extreme" as const, label: "Extreme" },
];

export function ScenarioTestingPage() {
  const [config, setConfig] = useState<ScenarioInput>({
    trafficSurge: 0,
    hasIncident: false,
    weatherCondition: "clear",
    timingStrategy: "fixed",
    demandLevel: "normal",
  });
  const [result, setResult] = useState<ScenarioOutput | null>(null);
  const [baselineResult, setBaselineResult] = useState<ScenarioOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    const [scenario, baseline] = await Promise.all([
      runScenario(config),
      runScenario({
        trafficSurge: 0,
        hasIncident: false,
        weatherCondition: "clear",
        timingStrategy: "fixed",
        demandLevel: "normal",
      }),
    ]);
    setResult(scenario);
    setBaselineResult(baseline);
    setLoading(false);
  };

  const comparisonData = result && baselineResult
    ? [
        { metric: "Avg Delay", scenario: result.avgDelay, baseline: baselineResult.avgDelay, unit: "sec/veh" },
        { metric: "Throughput", scenario: result.throughput, baseline: baselineResult.throughput, unit: "veh/hr" },
        { metric: "Congestion", scenario: result.congestionIndex, baseline: baselineResult.congestionIndex, unit: "%" },
        { metric: "Travel Time", scenario: result.travelTime, baseline: baselineResult.travelTime, unit: "min" },
        { metric: "Queue", scenario: result.queueLength, baseline: baselineResult.queueLength, unit: "veh" },
      ]
    : [];

  const radarData = result && baselineResult
    ? [
        { metric: "Delay", scenario: Math.min(100, (result.avgDelay / 200) * 100), baseline: Math.min(100, (baselineResult.avgDelay / 200) * 100) },
        { metric: "Throughput", scenario: (result.throughput / 6000) * 100, baseline: (baselineResult.throughput / 6000) * 100 },
        { metric: "Congestion", scenario: result.congestionIndex, baseline: baselineResult.congestionIndex },
        { metric: "Travel", scenario: Math.min(100, (result.travelTime / 50) * 100), baseline: Math.min(100, (baselineResult.travelTime / 50) * 100) },
        { metric: "Queue", scenario: Math.min(100, (result.queueLength / 100) * 100), baseline: Math.min(100, (baselineResult.queueLength / 100) * 100) },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-8"
      style={sg}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]" style={sg}>
            Scenario Testing
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1" style={{ ...mono, background: "#000" }}>
            Simulation Engine v2.1
          </span>
          <span className="text-[10px] uppercase font-bold mt-1 text-slate-500" style={mono}>
            What-If Analysis Module
          </span>
        </div>
      </div>

      {/* ── Scenario Controls ─────────────────────────────────── */}
      <div className="brutal-border bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <FlaskConical className="size-4" style={{ color: accent }} />
          <h3 className="text-sm font-black uppercase" style={sg}>Configure Scenario</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Traffic Surge */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
              Traffic Surge: +{config.trafficSurge}%
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={config.trafficSurge}
              onChange={(e) => setConfig({ ...config, trafficSurge: Number(e.target.value) })}
              className="w-full accent-[#ff3e00]"
            />
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase" style={mono}>
              <span>0%</span><span>+50%</span>
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Weather Condition</label>
            <div className="grid grid-cols-3 gap-1">
              {weatherOptions.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setConfig({ ...config, weatherCondition: w.value })}
                  className="brutal-border py-2 text-[10px] font-bold uppercase transition-colors"
                  style={{ ...mono, background: config.weatherCondition === w.value ? "#000" : "transparent", color: config.weatherCondition === w.value ? "#fff" : "#000" }}
                >
                  {w.icon} {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timing Strategy */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Signal Timing Strategy</label>
            <div className="grid grid-cols-3 gap-1">
              {timingOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setConfig({ ...config, timingStrategy: t.value })}
                  className="brutal-border py-2 text-[10px] font-bold uppercase transition-colors"
                  style={{ ...mono, background: config.timingStrategy === t.value ? accent : "transparent", color: config.timingStrategy === t.value ? "#fff" : "#000" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demand Level */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Demand Level</label>
            <div className="grid grid-cols-4 gap-1">
              {demandOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setConfig({ ...config, demandLevel: d.value })}
                  className="brutal-border py-2 text-[10px] font-bold uppercase transition-colors"
                  style={{ ...mono, background: config.demandLevel === d.value ? "#000" : "transparent", color: config.demandLevel === d.value ? "#fff" : "#000" }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Incident Simulation</label>
            <button
              onClick={() => setConfig({ ...config, hasIncident: !config.hasIncident })}
              className="w-full brutal-border py-2 text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2"
              style={{ ...mono, background: config.hasIncident ? accent : "transparent", color: config.hasIncident ? "#fff" : "#000" }}
            >
              <AlertTriangle className="size-3" />
              {config.hasIncident ? "Incident Active" : "No Incident"}
            </button>
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full brutal-border text-white py-3 font-black uppercase text-sm brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: accent, ...sg }}
            >
              <Zap className="size-4" />
              {loading ? "Simulating..." : "Run Scenario"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {result && baselineResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Result KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Avg Delay", value: `${result.avgDelay}s`, change: result.comparedToBaseline.delayChange, inverse: true, icon: Timer },
              { label: "Throughput", value: `${result.throughput}`, change: result.comparedToBaseline.throughputChange, inverse: false, icon: Gauge },
              { label: "Congestion", value: `${result.congestionIndex}%`, change: result.comparedToBaseline.congestionChange, inverse: true, icon: TrendingDown },
              { label: "Travel Time", value: `${result.travelTime}m`, change: ((result.travelTime / baselineResult.travelTime - 1) * 100), inverse: true, icon: Clock },
              { label: "Queue", value: `${result.queueLength}`, change: ((result.queueLength / baselineResult.queueLength - 1) * 100), inverse: true, icon: AlertTriangle },
              { label: "CO₂ Reduction", value: `${result.co2Reduction}%`, change: result.co2Reduction, inverse: false, icon: Cloud },
            ].map((kpi, i) => {
              const isGood = kpi.inverse ? kpi.change < 0 : kpi.change > 0;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="brutal-border p-4 bg-white brutal-shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase" style={mono}>{kpi.label}</span>
                    <kpi.icon className="size-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black tracking-tight" style={sg}>{kpi.value}</div>
                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-1">
                    {isGood ? <TrendingDown className="size-3 text-green-600" /> : <TrendingUp className="size-3" style={{ color: accent }} />}
                    <span className="text-[9px] font-black uppercase" style={{ ...mono, color: isGood ? "#15803d" : accent }}>
                      {kpi.change > 0 ? "+" : ""}{typeof kpi.change === "number" ? kpi.change.toFixed(1) : kpi.change}%
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase" style={mono}>vs baseline</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Comparison */}
            <div className="lg:col-span-7 brutal-border bg-white p-6">
              <h3 className="text-lg font-black uppercase mb-1" style={sg}>Scenario vs Baseline</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>Side-by-side metric comparison</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
                  <XAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
                    tickLine={false}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
                    tickLine={false}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
                    labelStyle={{ color: accent }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }} />
                  <Bar dataKey="baseline" name="Baseline" fill="#000" fillOpacity={0.15} radius={[2, 2, 0, 0]} maxBarSize={32} stroke="#000" strokeWidth={1} />
                  <Bar dataKey="scenario" name="Scenario" fill={accent} radius={[2, 2, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-5 brutal-border bg-white p-6">
              <h3 className="text-lg font-black uppercase mb-1" style={sg}>Impact Radar</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>Multi-dimensional comparison</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#000" strokeOpacity={0.1} />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, fill: "#000" } }
                  />
                  <PolarRadiusAxis tick={{ fontSize: 8 }} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#000" fill="#000" fillOpacity={0.05} strokeWidth={1.5} />
                  <Radar name="Scenario" dataKey="scenario" stroke={accent} fill={accent} fillOpacity={0.15} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendation */}
          <div className="brutal-border p-6 bg-black text-white">
            <div className="flex items-start gap-3">
              <Zap className="size-5 shrink-0 mt-0.5" style={{ color: accent }} />
              <div>
                <h3 className="text-lg font-black uppercase mb-2" style={sg}>Scenario Recommendation</h3>
                <p className="text-sm font-bold leading-relaxed text-white/60" style={mono}>
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && (
        <div className="brutal-border border-dashed p-12 text-center bg-slate-50">
          <FlaskConical className="size-10 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-black uppercase mb-2 text-slate-500" style={sg}>No Scenario Results Yet</h3>
          <p className="text-[10px] font-bold text-slate-400 max-w-md mx-auto" style={mono}>
            Configure the scenario parameters above and click &quot;Run Scenario&quot; to simulate traffic conditions and compare against the baseline.
          </p>
        </div>
      )}

      {/* ── Scenario History ──────────────────────────────────── */}
      <div className="brutal-border bg-white p-6">
        <h3 className="text-lg font-black uppercase mb-6" style={sg}>Recent Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarioHistory.map((s) => (
            <div key={s.id} className="brutal-border p-4 border-dashed hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase" style={sg}>{s.name}</h4>
                <span className="text-[9px] font-bold text-slate-400" style={mono}>{s.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase" style={mono}>
                <div><span className="text-slate-400">Delay:</span> {s.avgDelay}s</div>
                <div><span className="text-slate-400">Throughput:</span> {s.throughput}</div>
                <div><span className="text-slate-400">CI:</span> {s.congestionIndex}%</div>
                <div><span className="text-slate-400">Travel:</span> {s.travelTime}m</div>
              </div>
              <p className="mt-2 text-[9px] font-bold text-slate-500 leading-relaxed" style={mono}>
                {s.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
