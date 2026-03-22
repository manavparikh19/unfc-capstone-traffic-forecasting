"use client";

import { motion } from "framer-motion";
import {
  Database,
  BarChart3,
  Brain,
  Signal,
  FlaskConical,
  Target,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const pipelineSteps = [
  {
    icon: Database,
    title: "Data Collection",
    details: [
      "Loop detector traffic volume data (vehicles per 15-min interval)",
      "Speed, occupancy, and flow measurements across 1,240 intersections",
      "Weather data from municipal weather stations",
      "Event and construction zone schedules",
    ],
  },
  {
    icon: BarChart3,
    title: "Preprocessing",
    details: [
      "Missing value imputation using time-of-day median approach",
      "Outlier detection via IQR-based filtering (>3σ removed)",
      "Temporal alignment to consistent 15-minute intervals",
      "Normalization using Min-Max scaling for model input",
    ],
  },
  {
    icon: Target,
    title: "Congestion Metric",
    details: [
      "Congestion Index = weighted composite of speed ratio, volume-to-capacity ratio, and delay",
      "Classification thresholds: Low (<45), Moderate (45-60), Elevated (60-75), Severe (>75)",
      "Queue Pressure Index based on occupancy duration and spillback risk",
      "Travel Time Reliability as buffer time index (BTI)",
    ],
  },
  {
    icon: Brain,
    title: "Feature Engineering",
    details: [
      "Temporal: hour-of-day, day-of-week, is_peak_hour, is_weekend, is_holiday",
      "Lag features: t-1, t-2, t-4 volume and rolling 3hr moving average",
      "Weather: temperature, precipitation amount, visibility category",
      "Event: special_event flag, road_construction proximity index",
    ],
  },
  {
    icon: BarChart3,
    title: "Modeling Approach",
    details: [
      "XGBoost (best): gradient-boosted trees with 200 estimators, max_depth=6, learning_rate=0.1",
      "Random Forest: 150 trees, max_depth=8, as interpretability reference",
      "LSTM: 2-layer, 64 hidden units, 24-step lookback, dropout=0.2",
      "GRU: single-layer, 64 units, computationally lighter LSTM alternative",
    ],
  },
  {
    icon: Signal,
    title: "Signal Optimization",
    details: [
      "Objective: minimize total intersection delay subject to V/C ≤ 1.0 constraints",
      "Decision variables: green time allocation per phase within cycle length",
      "Input: forecasted volumes per approach for next cycle",
      "Method: Webster's formula with demand-responsive adjustments",
    ],
  },
  {
    icon: FlaskConical,
    title: "Simulation & Evaluation",
    details: [
      "What-if scenario engine with configurable surge, weather, incident parameters",
      "Metrics: average delay (s/veh), throughput (veh/hr), queue length, V/C ratio",
      "Comparison against fixed-time baseline across all test scenarios",
      "CO₂ impact estimated from idle time reduction at intersections",
    ],
  },
];

const evaluationMetrics = [
  { metric: "MAE (Mean Absolute Error)", value: "12.4 veh/hr", desc: "Average magnitude of prediction errors in vehicle count" },
  { metric: "RMSE (Root Mean Squared Error)", value: "16.8 veh/hr", desc: "Penalizes large errors more heavily than MAE" },
  { metric: "MAPE (Mean Abs % Error)", value: "6.1%", desc: "Percentage-based error for interpretability" },
  { metric: "R² (Coefficient of Determination)", value: "0.924", desc: "Proportion of variance explained by the model" },
  { metric: "Delay Reduction", value: "37.3%", desc: "Average delay reduction from optimized vs fixed-time signals" },
  { metric: "Throughput Improvement", value: "16.4%", desc: "More vehicles served per hour under optimized timing" },
];

const limitations = [
  "Model trained on historical data from a specific urban context; generalization to other cities requires retraining",
  "Weather features limited to temperature and precipitation; visibility and wind not included",
  "Signal optimization assumes isolated intersection control; corridor-level coordination not modeled",
  "Real-time data feed integration not implemented in current prototype; uses batch processing",
  "Pedestrian and cyclist interactions modeled through simplified conflict factors",
];

const futureWork = [
  "Multi-intersection corridor optimization with offset coordination",
  "Real-time data pipeline with streaming model inference",
  "Deep reinforcement learning for adaptive signal control policies",
  "Integration with connected vehicle (V2I) data for probe-based volume estimation",
  "Transfer learning for rapid deployment to new cities with limited local training data",
  "Interactive map visualization with real geographic intersection data",
];

export function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-12"
      style={sg}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]" style={sg}>
            Methodology
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1" style={{ ...mono, background: "#000" }}>
            Technical Documentation
          </span>
          <span className="text-[10px] uppercase font-bold mt-1 text-slate-500" style={mono}>
            Capstone Project — March 2026
          </span>
        </div>
      </div>

      {/* ── Problem Definition ────────────────────────────────── */}
      <section className="brutal-border bg-white p-8">
        <h2 className="text-2xl font-black uppercase mb-4 pb-3 border-b-4 border-black" style={sg}>
          Problem Definition
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4" style={mono}>
            <p className="text-sm font-bold leading-relaxed text-slate-700">
              Urban traffic congestion is a multi-dimensional challenge. Fixed-time signal control systems,
              which govern the majority of urban intersections, cannot adapt to temporal and spatial demand
              fluctuations. This leads to avoidable delays, increased fuel consumption, higher emissions,
              and reduced transportation network efficiency.
            </p>
            <p className="text-sm font-bold leading-relaxed text-slate-700">
              This project develops an integrated decision-support platform that uses machine learning
              to forecast traffic volumes, optimize signal timing plans based on predicted demand, and
              evaluate the operational impact through scenario-based simulation.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase" style={sg}>Research Questions</h3>
            {[
              "Can ML models forecast intersection-level traffic volume with sufficient accuracy to inform signal timing?",
              "How much delay reduction is achievable through demand-responsive signal optimization vs fixed-time plans?",
              "What is the sensitivity of optimization outcomes to external factors (weather, incidents, demand surges)?",
            ].map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-3 brutal-border border-dashed bg-slate-50">
                <span className="text-[10px] font-black shrink-0 mt-0.5" style={{ ...mono, color: accent }}>RQ{i + 1}</span>
                <p className="text-[11px] font-bold leading-relaxed text-slate-600" style={mono}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dataset Description ───────────────────────────────── */}
      <section className="brutal-border bg-white p-8">
        <h2 className="text-2xl font-black uppercase mb-6 pb-3 border-b-4 border-black" style={sg}>
          Dataset Description
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Data Points", value: "2.85M" },
            { label: "Intersections", value: "1,240" },
            { label: "Time Span", value: "12 months" },
            { label: "Resolution", value: "15-min intervals" },
          ].map((d) => (
            <div key={d.label} className="brutal-border p-4 text-center">
              <div className="text-2xl font-black tracking-tight" style={{ ...sg, color: accent }}>{d.value}</div>
              <div className="text-[9px] font-bold uppercase text-slate-500 mt-1" style={mono}>{d.label}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={mono}>
            <thead>
              <tr style={{ borderBottom: "3px solid #000" }}>
                {["Feature", "Type", "Source", "Description"].map((h) => (
                  <th key={h} className="py-2 px-3 text-[10px] font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[10px] font-bold">
              {[
                ["Volume", "Numeric", "Loop detectors", "Vehicle count per 15-min interval"],
                ["Speed", "Numeric", "Loop detectors", "Average speed (km/h) per interval"],
                ["Occupancy", "Numeric", "Loop detectors", "Percentage of time detector occupied"],
                ["Hour / Day", "Categorical", "Derived", "Temporal indicators for pattern capture"],
                ["Temperature", "Numeric", "Weather API", "Ambient temperature in °C"],
                ["Precipitation", "Numeric", "Weather API", "Rainfall/snowfall in mm"],
                ["Is Peak Hour", "Boolean", "Derived", "Binary flag for AM/PM peak periods"],
                ["Special Event", "Boolean", "Municipal data", "Stadium events, festivals, etc."],
              ].map((row, i) => (
                <tr key={i} className="border-b border-black/5">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3" style={j === 0 ? { fontWeight: 900, ...sg } : { color: "#64748b" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pipeline Steps ────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-black uppercase mb-8 pb-3 border-b-4 border-black" style={sg}>
          End-to-End Pipeline
        </h2>
        <div className="space-y-6">
          {pipelineSteps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="brutal-border bg-white overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-3 p-6 flex items-center gap-4 bg-black text-white">
                  <span className="text-3xl font-black tracking-tight" style={{ ...sg, color: accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <step.icon className="size-5 mb-1" style={{ color: accent }} />
                    <h3 className="text-sm font-black uppercase" style={sg}>{step.title}</h3>
                  </div>
                </div>
                <div className="lg:col-span-9 p-6" style={{ borderLeft: "3px solid #000" }}>
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-[11px] font-bold text-slate-600" style={mono}>
                        <CheckCircle className="size-3.5 text-green-600 shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Evaluation Metrics ────────────────────────────────── */}
      <section className="brutal-border bg-white p-8">
        <h2 className="text-2xl font-black uppercase mb-6 pb-3 border-b-4 border-black" style={sg}>
          Evaluation Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluationMetrics.map((em) => (
            <div key={em.metric} className="brutal-border p-4 border-dashed hover:bg-slate-50 transition-colors">
              <div className="text-2xl font-black tracking-tight mb-1" style={{ ...sg, color: accent }}>{em.value}</div>
              <div className="text-xs font-black uppercase mb-2" style={sg}>{em.metric}</div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed" style={mono}>{em.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Limitations & Future Work ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutal-border p-8 bg-white">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="size-5" style={{ color: accent }} />
            <h2 className="text-xl font-black uppercase" style={sg}>Limitations</h2>
          </div>
          <ul className="space-y-3">
            {limitations.map((l, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-600 leading-relaxed" style={mono}>
                <span className="text-[10px] font-black shrink-0 mt-0.5" style={{ color: accent }}>[{i + 1}]</span>
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="brutal-border p-8 bg-black text-white">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="size-5" style={{ color: accent }} />
            <h2 className="text-xl font-black uppercase" style={sg}>Future Work</h2>
          </div>
          <ul className="space-y-3">
            {futureWork.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-white/60 leading-relaxed" style={mono}>
                <ArrowRight className="size-3.5 shrink-0 mt-0.5" style={{ color: accent }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
