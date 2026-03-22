"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Gauge,
  Network,
  Signal,
  Timer,
  TrendingDown,
  Zap,
} from "lucide-react";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const miniTrend = [
  { t: "6a", v: 42 },
  { t: "8a", v: 86 },
  { t: "10a", v: 65 },
  { t: "12p", v: 73 },
  { t: "2p", v: 58 },
  { t: "4p", v: 79 },
  { t: "6p", v: 88 },
  { t: "8p", v: 54 },
];

const miniComparison = [
  { metric: "Delay", baseline: 118, optimized: 74 },
  { metric: "Queue", baseline: 73, optimized: 42 },
  { metric: "Travel", baseline: 31, optimized: 23 },
];

const featureModules = [
  {
    icon: BarChart3,
    title: "Executive Dashboard",
    desc: "City-wide KPIs, congestion trends, and operational status at a glance.",
    href: "/dashboard",
    tag: "analytics",
  },
  {
    icon: Brain,
    title: "AI Forecasting",
    desc: "Multi-model traffic volume prediction with confidence intervals and feature analysis.",
    href: "/forecasting",
    tag: "ml_predict",
  },
  {
    icon: Signal,
    title: "Signal Optimization",
    desc: "Algorithmic phase allocation reducing delay through demand-responsive timing.",
    href: "/signal-optimization",
    tag: "optimize",
  },
  {
    icon: Zap,
    title: "Scenario Testing",
    desc: "What-if simulations for surges, incidents, weather events, and timing strategies.",
    href: "/route-planner",
    tag: "simulate",
  },
  {
    icon: Network,
    title: "Hotspot Explorer",
    desc: "Ranked congestion hotspots with severity scoring and improvement potential.",
    href: "/hotspots",
    tag: "network",
  },
  {
    icon: Activity,
    title: "Methodology",
    desc: "Technical documentation of pipeline, models, metrics, and evaluation approach.",
    href: "/about",
    tag: "docs",
  },
];

const metrics = [
  { value: "37.3%", label: "Delay Reduction", sub: "vs. fixed-time baseline" },
  { value: "0.924", label: "Best Model R²", sub: "XGBoost on test set" },
  { value: "12.4", label: "Forecast MAE", sub: "vehicles per hour" },
  { value: "1,240", label: "Intersections", sub: "analyzed in network" },
  { value: "16.4%", label: "Throughput Gain", sub: "optimized vs baseline" },
  { value: "<0.8s", label: "Optimization Runtime", sub: "per intersection" },
];

const pipelineSteps = [
  { step: "01", label: "Raw Data", desc: "Volume, speed, occupancy from loop detectors" },
  { step: "02", label: "Preprocessing", desc: "Cleaning, imputation, normalization" },
  { step: "03", label: "Feature Engineering", desc: "Temporal, lag, weather, event features" },
  { step: "04", label: "Forecasting", desc: "XGBoost, RF, LSTM model training" },
  { step: "05", label: "Signal Optimization", desc: "Phase timing allocation algorithm" },
  { step: "06", label: "Simulation", desc: "What-if scenario testing engine" },
  { step: "07", label: "Impact Evaluation", desc: "Delay, throughput, queue metrics" },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export function HomePage() {
  return (
    <div className="relative z-10 px-4 lg:px-8 py-12 space-y-12" style={sg}>
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 brutal-border bg-white overflow-hidden">
        <div className="lg:col-span-7 p-8 lg:p-14" style={{ borderRight: "3px solid #000" }}>
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div
                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-white"
                style={{ background: "#000", ...mono }}
              >
                System Status: Operational
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-green-700" style={mono}>Live</span>
              </div>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter uppercase"
              style={sg}
            >
              Predict Traffic.<br />
              Optimize Signals.<br />
              <span style={{ color: accent }}>Reduce Delay.</span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl font-medium leading-snug" style={mono}>
              AI-powered congestion forecasting and signal timing optimization for smarter urban mobility decisions.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/dashboard"
                className="brutal-border brutal-shadow brutal-btn px-8 py-4 text-lg font-black uppercase text-white flex items-center gap-2"
                style={{ background: accent, ...sg }}
              >
                Open Dashboard <ChevronRight className="size-5" />
              </Link>
              <Link
                href="/about"
                className="brutal-border brutal-shadow brutal-btn bg-white text-black px-8 py-4 text-lg font-black uppercase"
                style={sg}
              >
                View Methodology
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Live Preview Panels */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Mini Forecast Preview */}
          <div className="p-6 flex-1" style={{ borderBottom: "3px solid #000" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs flex items-center gap-2" style={mono}>
                <Timer className="size-3.5" style={{ color: accent }} />
                Congestion Forecast
              </h3>
              <Link href="/forecasting" className="text-[10px] font-bold uppercase hover:underline" style={{ ...mono, color: accent }}>
                View Full →
              </Link>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniTrend}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={accent}
                    fill={accent}
                    fillOpacity={0.12}
                    strokeWidth={2}
                    dot={false}
                  />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#000", border: "2px solid #000", fontSize: 10, fontWeight: 700, color: "#fff" }}
                    labelStyle={{ color: accent }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] font-bold uppercase text-slate-500" style={mono}>
              <span>Peak: 88 (6pm)</span>
              <span>24hr Window</span>
            </div>
          </div>

          {/* Mini KPIs */}
          <div className="grid grid-cols-3 divide-x-3 divide-black" style={{ borderBottom: "3px solid #000" }}>
            {[
              { label: "Delay Cut", value: "37.3%", icon: TrendingDown },
              { label: "Model R²", value: "0.924", icon: Brain },
              { label: "Nodes", value: "1,240", icon: Gauge },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 text-center">
                <kpi.icon className="size-4 mx-auto mb-2" style={{ color: accent }} />
                <div className="text-xl font-black tracking-tight" style={sg}>{kpi.value}</div>
                <div className="text-[9px] font-bold uppercase text-slate-500 mt-1" style={mono}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Mini Optimization Preview */}
          <div className="p-6 flex-1 bg-black text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs flex items-center gap-2" style={mono}>
                <Signal className="size-3.5" style={{ color: accent }} />
                Optimization Impact
              </h3>
              <Link href="/signal-optimization" className="text-[10px] font-bold uppercase hover:underline" style={{ ...mono, color: accent }}>
                Details →
              </Link>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={miniComparison} barGap={2}>
                  <XAxis dataKey="metric" tick={{ fontSize: 9, fill: "#999", fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#111", border: "2px solid #333", fontSize: 10, fontWeight: 700, color: "#fff" }} />
                  <Bar dataKey="baseline" fill="#333" radius={[2, 2, 0, 0]} maxBarSize={16} name="Baseline" />
                  <Bar dataKey="optimized" fill={accent} radius={[2, 2, 0, 0]} maxBarSize={16} name="Optimized" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem + Solution ───────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0 brutal-border overflow-hidden">
        <div className="p-8" style={{ borderRight: "3px solid #000" }}>
          <h3 className="font-bold uppercase mb-4 flex items-center gap-2" style={mono}>
            <span className="text-lg" style={{ color: accent }}>⚠</span> Problem
          </h3>
          <ul className="space-y-3 text-sm" style={mono}>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: accent }}>[01]</span>
              <span>Fixed-time signals cannot respond to dynamic demand, causing 40-60% excess delay during peak hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: accent }}>[02]</span>
              <span>Traditional planning relies on reactive hardware upgrades with no predictive capability.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: accent }}>[03]</span>
              <span>Cities lack integrated tools to forecast, optimize, and evaluate signal strategies together.</span>
            </li>
          </ul>
        </div>
        <div className="p-8 bg-black text-white">
          <h3 className="font-bold uppercase mb-4 flex items-center gap-2" style={mono}>
            <span style={{ color: "#22c55e" }}>✓</span> Solution
          </h3>
          <ul className="space-y-3 text-sm" style={mono}>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: "#22c55e" }}>[01]</span>
              <span>ML-based volume forecasting predicts demand 24 hours ahead with R² = 0.924.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: "#22c55e" }}>[02]</span>
              <span>Algorithmic signal timing optimization reduces average delay by 37.3%.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: "#22c55e" }}>[03]</span>
              <span>Integrated decision-support platform connects prediction, optimization, and simulation.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Platform Modules ─────────────────────────────────── */}
      <section>
        <h2
          className="text-3xl font-black uppercase mb-8 pb-4 border-b-4 border-black"
          style={sg}
        >
          Platform Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureModules.map((mod, i) => (
            <motion.div
              key={mod.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <Link href={mod.href} className="block group">
                <div className="brutal-border p-6 bg-white brutal-shadow-sm transition-all group-hover:-translate-y-1 group-hover:brutal-shadow h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 brutal-border flex items-center justify-center bg-black group-hover:bg-accent transition-colors">
                      <mod.icon className="size-5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-slate-100 brutal-border border-dashed" style={mono}>
                      {mod.tag}
                    </span>
                  </div>
                  <h4 className="text-lg font-black uppercase mb-2 leading-tight" style={sg}>
                    {mod.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed" style={mono}>
                    {mod.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center gap-1 text-[10px] font-black uppercase" style={{ ...mono, color: accent }}>
                    Open Module <ChevronRight className="size-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Validated Metrics ─────────────────────────────────── */}
      <section className="brutal-border bg-black text-white p-8 lg:p-12">
        <h3
          className="font-bold uppercase mb-10 text-center tracking-widest pb-4"
          style={{ ...mono, borderBottom: "1px solid rgba(255,255,255,0.15)" }}
        >
          Validated Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center space-y-2"
            >
              <div
                className="text-3xl lg:text-4xl font-black tracking-tighter"
                style={{ color: accent, ...sg }}
              >
                {m.value}
              </div>
              <div className="text-xs uppercase font-bold" style={mono}>
                {m.label}
              </div>
              <div className="text-[9px] uppercase font-bold text-white/40" style={mono}>
                {m.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pipeline Section ──────────────────────────────────── */}
      <section>
        <h2
          className="text-3xl font-black uppercase mb-8 pb-4 border-b-4 border-black"
          style={sg}
        >
          System Pipeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {pipelineSteps.map((step, i) => (
            <motion.div
              key={step.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="brutal-border p-4 bg-white relative group hover:bg-black hover:text-white transition-colors"
            >
              <div
                className="text-3xl font-black tracking-tighter mb-2 group-hover:text-accent transition-colors"
                style={{ color: accent, ...sg }}
              >
                {step.step}
              </div>
              <h4 className="text-sm font-black uppercase mb-1" style={sg}>
                {step.label}
              </h4>
              <p className="text-[9px] font-bold text-slate-500 leading-relaxed group-hover:text-white/50 transition-colors" style={mono}>
                {step.desc}
              </p>
              {i < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-3 h-0.5 bg-black z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Strategic Relevance ───────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="brutal-border p-8 bg-white">
          <h3
            className="text-2xl font-black uppercase mb-6 underline underline-offset-4"
            style={{ textDecorationColor: accent, textDecorationThickness: "6px", ...sg }}
          >
            Why This Matters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { key: "Commute Efficiency", desc: "37% delay reduction translates to measurable time savings for daily commuters." },
              { key: "Emission Reduction", desc: "Lower idle times at intersections directly reduce urban CO₂ output." },
              { key: "Infrastructure ROI", desc: "Software-based optimization delivers improvement without capital construction." },
              { key: "Scalable Deployment", desc: "Framework can extend from single intersections to city-wide networks." },
            ].map(({ key, desc }) => (
              <div key={key} className="p-4 brutal-border border-dashed bg-slate-50/50">
                <div className="font-bold text-sm uppercase mb-2" style={sg}>{key}</div>
                <p className="text-[10px] font-bold leading-relaxed text-slate-600" style={mono}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="brutal-border p-8 flex flex-col items-center justify-center text-center text-white"
          style={{ background: accent }}
        >
          <div className="space-y-6 max-w-md">
            <h3 className="text-3xl font-black uppercase leading-tight" style={sg}>
              Explore the<br />Live Platform
            </h3>
            <p className="font-bold text-sm" style={mono}>
              Navigate the full analytics suite — dashboard, forecasting, optimization, and scenario testing.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 brutal-btn bg-black text-white px-10 py-4 text-lg font-black uppercase brutal-border brutal-shadow"
              style={{ borderColor: "#fff", ...sg }}
            >
              Launch Dashboard <ChevronRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
