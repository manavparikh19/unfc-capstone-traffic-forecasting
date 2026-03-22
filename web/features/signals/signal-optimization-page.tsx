"use client";

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
import { CheckCircle, Signal, TrendingDown, Download } from "lucide-react";
import {
  signalMetrics,
  signalTrend,
  timingPhases,
  delayByApproach,
  vcRatioData,
} from "@/features/traffic/data/demo-data";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

export function SignalOptimizationPage() {
  const cycleBaseline = 140;
  const cycleOptimized = 120;

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
            Signal Optimization
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1" style={{ ...mono, background: "#000" }}>
            Intersection: King St x Spadina Ave
          </span>
          <span className="text-[10px] uppercase font-bold mt-1 text-slate-500" style={mono}>
            Mode: Demand-Responsive Optimization
          </span>
        </div>
      </div>

      {/* ── KPI Comparison Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {signalMetrics.map((m, i) => {
          const isInverse = m.label === "Throughput";
          const change = isInverse
            ? ((m.optimized - m.baseline) / m.baseline * 100).toFixed(1)
            : ((m.baseline - m.optimized) / m.baseline * 100).toFixed(1);
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

      {/* ── Timing Plan + Cycle Length ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phase Timing */}
        <div className="lg:col-span-7 brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Phase Timing Plan</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>
            Green time allocation by phase (seconds)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={timingPhases} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
              <XAxis
                dataKey="phase"
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
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
          {/* Phase Details Table */}
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
                {timingPhases.map((p) => (
                  <tr key={p.phase} className="border-b border-black/5">
                    <td className="py-2 px-3 font-black" style={sg}>{p.phase}</td>
                    <td className="py-2 px-3 text-slate-600">{p.direction}</td>
                    <td className="py-2 px-3">{p.baseline}s</td>
                    <td className="py-2 px-3" style={{ color: accent }}>{p.optimized}s</td>
                    <td className="py-2 px-3" style={{ color: p.optimized > p.baseline ? "#15803d" : accent }}>
                      {p.optimized > p.baseline ? "+" : ""}{p.optimized - p.baseline}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cycle Length + Delay by Approach */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cycle Length */}
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
                {cycleBaseline - cycleOptimized}s reduction in cycle length improves responsiveness
              </span>
            </div>
          </div>

          {/* Delay by Approach */}
          <div className="brutal-border bg-white p-6">
            <h3 className="text-lg font-black uppercase mb-1" style={sg}>Delay by Approach</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-4" style={mono}>Average delay per vehicle (seconds)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={delayByApproach} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
                  tickLine={false}
                  axisLine={{ stroke: "#000", strokeWidth: 2 }}
                />
                <YAxis
                  type="category"
                  dataKey="approach"
                  tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
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

      {/* ── V/C Ratio Over Time ────────────────────────────────── */}
      <div className="brutal-border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black uppercase" style={sg}>Volume-to-Capacity Ratio</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
              V/C ratio throughout the day — values above 1.0 indicate oversaturation
            </p>
          </div>
          <div className="text-[10px] font-bold px-2 py-0.5 bg-red-50 brutal-border border-red-200" style={mono}>
            Threshold: 1.0
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={vcRatioData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
            />
            <YAxis
              domain={[0.4, 1.2]}
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }
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

      {/* ── Recommendation + Export ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutal-border p-6 bg-black text-white">
          <div className="flex items-start gap-3">
            <Signal className="size-5 shrink-0 mt-0.5" style={{ color: accent }} />
            <div>
              <h3 className="text-lg font-black uppercase mb-2" style={sg}>Optimization Recommendation</h3>
              <p className="text-sm font-bold leading-relaxed text-white/60" style={mono}>
                The demand-responsive timing plan reduces average delay by 37.3% and eliminates
                oversaturation (V/C {">"} 1.0) during PM peak. Primary benefit comes from reallocating
                green time from low-demand EB/WB left-turn phases to high-demand NB/SB through phases.
                Cycle length reduction from 140s to 120s improves pedestrian service frequency.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["37% less delay", "16% more throughput", "43% shorter queues", "No oversaturation"].map((tag) => (
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
              Minimize total intersection delay while maintaining acceptable V/C ratios
              across all approaches. Secondary objective: maximize corridor throughput
              without exceeding queue storage capacity on any approach.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 brutal-border text-white py-3 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2" style={{ background: accent, ...sg }}>
              <Download className="size-4" /> Export Report
            </button>
            <button className="flex-1 brutal-border bg-black text-white py-3 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5" style={sg}>
              Run Simulation
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
