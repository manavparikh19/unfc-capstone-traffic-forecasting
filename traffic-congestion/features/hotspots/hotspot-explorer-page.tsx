"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  BarChart3,
  Signal,
  FlaskConical,
  MapPin,
} from "lucide-react";
import { HotspotMap } from "@/components/visualization/hotspot-map";
import { hotspots } from "@/features/traffic/data/demo-data";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

type SeverityFilter = "All" | "Critical" | "High" | "Medium";

const trendIcon = {
  rising: TrendingUp,
  stable: Minus,
  falling: TrendingDown,
};

const trendColor = {
  rising: accent,
  stable: "#64748b",
  falling: "#15803d",
};

export function HotspotExplorerPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");

  const sorted = [...hotspots].sort((a, b) => b.congestionScore - a.congestionScore);
  const filtered =
    severityFilter === "All"
      ? sorted
      : sorted.filter((h) => h.severity === severityFilter);

  const criticalCount = hotspots.filter((h) => h.severity === "Critical").length;
  const highCount = hotspots.filter((h) => h.severity === "High").length;
  const avgSeverity = +(
    hotspots.reduce((s, h) => s + h.congestionScore, 0) / hotspots.length
  ).toFixed(1);
  const totalImprovementPotential = Math.round(
    hotspots.reduce((s, h) => s + h.improvementPotential, 0) / hotspots.length,
  );

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
            Hotspot Explorer
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1" style={{ ...mono, background: "#000" }}>
            Network Analysis
          </span>
          <span className="text-[10px] uppercase font-bold mt-1 text-slate-500" style={mono}>
            {hotspots.length} intersections monitored
          </span>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical Hotspots", value: criticalCount, color: accent, tag: "Immediate action" },
          { label: "High Severity", value: highCount, color: "#d97706", tag: "Monitoring required" },
          { label: "Avg Congestion Score", value: avgSeverity, color: "#000", tag: "Network average" },
          { label: "Avg Improvement Potential", value: `${totalImprovementPotential}%`, color: "#15803d", tag: "With optimization" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="brutal-border p-4 bg-white brutal-shadow-sm"
          >
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-1" style={mono}>{kpi.label}</div>
            <div className="text-3xl font-black tracking-tight" style={{ ...sg, color: kpi.color }}>{kpi.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase mt-2 pt-2 border-t border-black/5" style={mono}>{kpi.tag}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Severity Filter ───────────────────────────────────── */}
      <div className="flex gap-2">
        {(["All", "Critical", "High", "Medium"] as SeverityFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className="brutal-border px-4 py-2 text-[10px] font-bold uppercase transition-colors"
            style={{
              ...mono,
              background: severityFilter === s ? (s === "Critical" ? accent : "#000") : "transparent",
              color: severityFilter === s ? "#fff" : "#000",
            }}
          >
            {s} {s !== "All" && `(${hotspots.filter((h) => h.severity === s).length})`}
          </button>
        ))}
      </div>

      {/* ── Map + List ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Map */}
        <div className="lg:col-span-7 brutal-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase" style={sg}>Network Congestion Map</h3>
            <div className="flex gap-3 text-[9px] font-bold uppercase" style={mono}>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: accent }} /> Critical
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-400" /> High
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-400" /> Medium
              </div>
            </div>
          </div>
          <div className="brutal-border overflow-hidden relative" style={{ minHeight: "460px" }}>
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                opacity: 0.08,
              }}
            />
            <HotspotMap items={filtered} />
          </div>
        </div>

        {/* Ranked List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-black uppercase pb-3 border-b-4 border-black" style={sg}>
            Ranked Hotspots ({filtered.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((h, index) => {
              const TrendIcon = trendIcon[h.trend];
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="brutal-border p-4 bg-white brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-[9px] font-black" style={mono}>
                          {index + 1}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase" style={mono}>{h.area}</span>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight" style={sg}>{h.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrendIcon className="size-3" style={{ color: trendColor[h.trend] }} />
                      <span
                        className="px-2 py-0.5 text-[9px] font-black uppercase brutal-border"
                        style={{
                          borderColor: h.severity === "Critical" ? accent : "#000",
                          color: h.severity === "Critical" ? accent : "#000",
                          ...mono,
                        }}
                      >
                        {h.severity}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 border-t border-black/5 pt-3" style={mono}>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Score</div>
                      <div className="text-sm font-black">{h.congestionScore}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Delay</div>
                      <div className="text-sm font-black">{h.averageDelay}m</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Queue</div>
                      <div className="text-sm font-black">{h.queuePressure}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Potential</div>
                      <div className="text-sm font-black" style={{ color: "#15803d" }}>+{h.improvementPotential}%</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-black/5">
                    {[
                      { label: "Forecast", href: "/forecasting", icon: BarChart3 },
                      { label: "Optimize", href: "/signal-optimization", icon: Signal },
                      { label: "Simulate", href: "/route-planner", icon: FlaskConical },
                    ].map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold uppercase brutal-border border-dashed hover:bg-black hover:text-white transition-colors"
                        style={mono}
                      >
                        <action.icon className="size-2.5" /> {action.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
