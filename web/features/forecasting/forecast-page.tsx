"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Brain, CheckCircle, ChevronRight, Trophy } from "lucide-react";
import { BrutalLineChart } from "@/components/charts/line-chart";
import {
  forecastModels,
  hourlyForecastData,
  featureImportanceData,
  modelComparisonMonthly,
} from "@/features/traffic/data/demo-data";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const intersectionOptions = [
  "King St x Spadina Ave",
  "Front St x Bay St",
  "Eglinton Ave x Yonge",
  "University Ave x College",
];

const horizonOptions = ["1HR", "6HR", "24HR"] as const;
type Horizon = (typeof horizonOptions)[number];

const modelColors: Record<string, string> = {
  xgboost: accent,
  rf: "#000",
  lstm: "#6366f1",
  gru: "#0891b2",
};

export function ForecastPage() {
  const [horizon, setHorizon] = useState<Horizon>("24HR");
  const [intersection, setIntersection] = useState(intersectionOptions[0]);
  const [selectedModel, setSelectedModel] = useState("XGBoost");

  const rankedModels = [...forecastModels].sort((a, b) => a.mae - b.mae);
  const bestModel = rankedModels[0];

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
            Forecasting
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1" style={{ ...mono, background: "#000" }}>
            Best Model: {bestModel.name}
          </span>
          <span className="text-[10px] uppercase font-bold mt-1 text-slate-500" style={mono}>
            R² = {bestModel.r2} | MAE = {bestModel.mae} veh/hr
          </span>
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────────── */}
      <div className="brutal-border bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Intersection</label>
            <select
              value={intersection}
              onChange={(e) => setIntersection(e.target.value)}
              className="w-full brutal-border bg-white text-xs font-bold uppercase p-2"
              style={mono}
            >
              {intersectionOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Forecast Horizon</label>
            <div className="grid grid-cols-3 gap-1">
              {horizonOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className="brutal-border py-2 text-[10px] font-bold uppercase transition-colors"
                  style={{ ...mono, background: horizon === h ? "#000" : "transparent", color: horizon === h ? "#fff" : "#000" }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Model Selection</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full brutal-border bg-white text-xs font-bold uppercase p-2"
              style={mono}
            >
              {rankedModels.map((m) => (
                <option key={m.name} value={m.name}>{m.name}{m.tag === "best" ? " ★" : ""}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full brutal-border text-white py-2 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5" style={{ background: accent, ...sg }}>
              Run Forecast
            </button>
          </div>
        </div>
      </div>

      {/* ── Error Metrics Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "MAE", value: `${bestModel.mae}`, unit: "veh/hr", desc: "Mean Absolute Error" },
          { label: "RMSE", value: `${bestModel.rmse}`, unit: "veh/hr", desc: "Root Mean Squared Error" },
          { label: "MAPE", value: `${bestModel.mape}%`, unit: "", desc: "Mean Abs % Error" },
          { label: "R² Score", value: `${bestModel.r2}`, unit: "", desc: "Coefficient of Determination" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="brutal-border p-4 bg-white brutal-shadow-sm"
          >
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-1" style={mono}>{m.desc}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight" style={{ ...sg, color: i === 3 ? "#15803d" : accent }}>{m.value}</span>
              {m.unit && <span className="text-[10px] font-bold text-slate-400 uppercase" style={mono}>{m.unit}</span>}
            </div>
            <div className="text-[10px] font-black uppercase mt-2 pt-2 border-t border-black/5" style={mono}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Forecast Chart ───────────────────────────────── */}
      <div className="brutal-border bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black uppercase" style={sg}>Forecast vs Actual Volume</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
              Intersection: {intersection} | Horizon: {horizon} | 95% confidence interval
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-bold" style={mono}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black" /> <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ background: accent }} /> <span>Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ background: `${accent}20`, border: `1px dashed ${accent}` }} /> <span>CI Band</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={hourlyForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              label={{ value: "Vehicles / Hour", angle: -90, position: "insideLeft", style: { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 } }}
            />
            <Tooltip
              contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
              labelStyle={{ color: accent }}
            />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill={accent} fillOpacity={0.08} name="Upper CI" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" fillOpacity={1} name="Lower CI" />
            <Area type="monotone" dataKey="actual" stroke="#000" fill="none" strokeWidth={2.5} dot={{ r: 3, fill: "#000" }} name="Actual" />
            <Area type="monotone" dataKey="predicted" stroke={accent} fill="none" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: accent }} name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Model Comparison + Feature Importance ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Comparison */}
        <div className="lg:col-span-7 brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Model Comparison</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>MAE by month across all models</p>
          <BrutalLineChart
            data={modelComparisonMonthly}
            xKey="month"
            series={[
              { dataKey: "xgboost", name: "XGBoost", color: accent },
              { dataKey: "rf", name: "Random Forest", color: "#000" },
              { dataKey: "lstm", name: "LSTM", color: "#6366f1" },
              { dataKey: "gru", name: "GRU", color: "#0891b2" },
            ]}
            height={280}
            yLabel="MAE (veh/hr)"
          />
        </div>

        {/* Feature Importance */}
        <div className="lg:col-span-5 brutal-border bg-white p-6">
          <h3 className="text-lg font-black uppercase mb-1" style={sg}>Feature Importance</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>XGBoost — top 10 features by gain</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
                domain={[0, 0.3]}
              />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 9, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
                width={120}
              />
              <Tooltip
                contentStyle={{ background: "#000", border: "3px solid #000", fontFamily: "var(--font-roboto-mono)", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}
                labelStyle={{ color: accent }}
                formatter={(value) => [(Number(value) * 100).toFixed(1) + "%", "Importance"]}
              />
              <Bar dataKey="importance" fill={accent} radius={[0, 2, 2, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Model Summary Table ───────────────────────────────── */}
      <div className="brutal-border bg-white p-6 overflow-x-auto">
        <h3 className="text-lg font-black uppercase mb-6" style={sg}>Model Evaluation Summary</h3>
        <table className="w-full text-left border-collapse" style={mono}>
          <thead>
            <tr style={{ borderBottom: "3px solid #000" }}>
              {["Model", "MAE", "RMSE", "MAPE", "R²", "Stability", ""].map((h) => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs font-bold uppercase">
            {rankedModels.map((m, i) => (
              <tr key={m.name} className="border-b border-black/5 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-black flex items-center gap-2" style={sg}>
                  {i === 0 && <Trophy className="size-3.5" style={{ color: accent }} />}
                  {m.name}
                </td>
                <td className="py-4 px-4">{m.mae} veh/hr</td>
                <td className="py-4 px-4">{m.rmse} veh/hr</td>
                <td className="py-4 px-4">{m.mape}%</td>
                <td className="py-4 px-4" style={{ color: m.r2 > 0.9 ? "#15803d" : "#000" }}>{m.r2}</td>
                <td className="py-4 px-4">{m.stability}%</td>
                <td className="py-4 px-4">
                  {i === 0 && (
                    <span className="px-2 py-0.5 text-[9px] bg-green-100 text-green-800 brutal-border border-green-300">
                      Best
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Explanation Panel ──────────────────────────────────── */}
      <div className="brutal-border p-6 bg-black text-white">
        <div className="flex items-start gap-4">
          <Brain className="size-6 shrink-0 mt-1" style={{ color: accent }} />
          <div>
            <h3 className="text-lg font-black uppercase mb-2" style={sg}>What Does This Model Predict?</h3>
            <p className="text-sm font-bold leading-relaxed text-white/60" style={mono}>
              The forecasting module predicts traffic volume (vehicles per hour) at individual intersections
              for future time intervals. Using historical patterns, temporal features (hour, day-of-week),
              weather data, and lag variables, the model generates predictions with confidence intervals.
              These forecasts feed directly into the signal optimization module, enabling proactive rather
              than reactive traffic management. The best-performing model (XGBoost, R² = {bestModel.r2})
              is selected based on cross-validated error metrics.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
