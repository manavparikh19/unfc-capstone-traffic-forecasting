"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Brain, ChevronDown, Search, Trophy } from "lucide-react";
import { BrutalLineChart } from "@/components/charts/line-chart";
import {
  getForecastData,
  getForecastLocations,
  type ForecastLocationOption,
  type ForecastResponse,
} from "@/lib/api";
import {
  forecastModels as demoForecastModels,
  hourlyForecastData as demoHourlyForecastData,
  featureImportanceData as demoFeatureImportanceData,
  modelComparisonMonthly as demoModelComparisonMonthly,
} from "@/features/traffic/data/demo-data";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

const fallbackLocationOptions: ForecastLocationOption[] = [
  { locationId: "10133019_NB", label: "King St x Spadina Ave" },
  { locationId: "913150_WB", label: "Front St x Bay St" },
  { locationId: "8417204_WB", label: "Eglinton Ave x Yonge" },
  { locationId: "913167_EB", label: "University Ave x College" },
];

const horizonOptions = ["3HR", "6HR", "12HR", "24HR"] as const;
type Horizon = (typeof horizonOptions)[number];
const horizonToHours: Record<Horizon, number> = {
  "3HR": 3,
  "6HR": 6,
  "12HR": 12,
  "24HR": 24,
};

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000);
}

export function ForecastPage() {
  const allowFallback =
    process.env.NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR === "true";
  const [horizon, setHorizon] = useState<Horizon>("24HR");
  const [locationOptions, setLocationOptions] = useState<ForecastLocationOption[]>(
    fallbackLocationOptions,
  );
  const [selectedLocationId, setSelectedLocationId] = useState(
    fallbackLocationOptions[0].locationId,
  );
  const [selectedModel, setSelectedModel] = useState("");
  const [forecastStartLocal, setForecastStartLocal] = useState(() =>
    toDateTimeLocalValue(minutesFromNow(5)),
  );
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  const rankedDemoModels = [...demoForecastModels].sort((a, b) => a.mae - b.mae);
  const rankedModels =
    forecastData?.models && forecastData.models.length > 0
      ? forecastData.models
      : allowFallback
        ? rankedDemoModels
        : [];
  const bestModel = rankedModels[0] ?? {
    name: "Unavailable",
    mae: 0,
    rmse: 0,
    mape: 0,
    r2: 0,
    stability: 0,
    summary: "No model data available.",
  };
  const activeModel =
    rankedModels.find((model) => model.name === selectedModel) ?? bestModel;
  const hourlyData =
    forecastData?.hourlyData ?? (allowFallback ? demoHourlyForecastData : []);
  const modelComparison =
    forecastData?.modelComparison ??
    (allowFallback ? demoModelComparisonMonthly : []);
  const featureImportance =
    forecastData?.featureImportance ??
    (allowFallback ? demoFeatureImportanceData : []);
  const servedModelName = forecastData?.meta?.model_name ?? activeModel.name;
  const selectedLocationLabel =
    locationOptions.find((option) => option.locationId === selectedLocationId)
      ?.label ?? selectedLocationId;
  const hasHistoricalActuals = hourlyData.some(
    (point) => point.actual !== null && Number.isFinite(point.actual),
  );
  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const minForecastStartLocal = toDateTimeLocalValue(minutesFromNow(-60));
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

  useEffect(() => {
    void (async () => {
      try {
        const options = await getForecastLocations();
        setLocationOptions(options);
        setSelectedLocationId((current) =>
          options.some((option) => option.locationId === current)
            ? current
            : (options[0]?.locationId ?? current),
        );
      } catch {
        setErrorMessage(
          "Location list service is unavailable. Please retry after backend recovery.",
        );
      }
    })();
  }, []);

  const runForecast = useCallback(async () => {
    const startTimestamp =
      forecastStartLocal && forecastStartLocal.trim().length > 0
        ? forecastStartLocal
        : undefined;
    const parsedStart =
      startTimestamp && startTimestamp.length > 0
        ? new Date(startTimestamp)
        : null;
    if (
      !parsedStart ||
      Number.isNaN(parsedStart.getTime()) ||
      parsedStart.getTime() < (Date.now() - 60 * 60 * 1000)
    ) {
      setErrorMessage("Forecast start time cannot be more than 1 hour in the past.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getForecastData({
        locationId: selectedLocationId,
        horizonHours: horizonToHours[horizon],
        modelName: selectedModel || undefined,
        startTimestamp,
      });
      setForecastData(data);
      setSelectedModel((current) =>
        data.models.some((model) => model.name === current)
          ? current
          : (data.bestModel?.name ?? ""),
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Live forecast service is unavailable. Please retry after backend recovery.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [forecastStartLocal, horizon, selectedLocationId, selectedModel]);

  useEffect(() => {
    void runForecast();
    // Refresh when controls change so served inference matches current selection.
  }, [runForecast]);

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
            Selected: {activeModel.name} | Served: {servedModelName} | R² = {activeModel.r2} | MAE = {activeModel.mae} veh/hr
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="brutal-border bg-red-50 px-4 py-3 text-[10px] font-bold uppercase text-red-700" style={mono}>
          {errorMessage}
        </div>
      )}

      {/* ── Controls ──────────────────────────────────────────── */}
      <div className="brutal-border bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Intersection</label>
            <div className="relative" ref={locationMenuRef}>
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
                <div className="absolute left-0 sm:left-0 sm:translate-x-0 top-full mt-1 w-[calc(100vw-2rem)] sm:w-[min(52rem,calc(100vw-2.5rem))] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2.5rem)] brutal-border bg-white p-2 z-40 brutal-shadow-sm">
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
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Forecast Horizon</label>
            <div className="grid grid-cols-4 gap-1">
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
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>Forecast Start Time</label>
            <input
              type="datetime-local"
              value={forecastStartLocal}
              onChange={(e) => setForecastStartLocal(e.target.value)}
              min={minForecastStartLocal}
              className="w-full brutal-border bg-white text-xs font-bold p-2"
              style={mono}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full brutal-border text-white py-2 font-black uppercase text-xs brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-70"
              style={{ background: accent, ...sg }}
              onClick={() => {
                void runForecast();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh Forecast"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Error Metrics Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "MAE", value: `${activeModel.mae}`, unit: "veh/hr", desc: "Mean Absolute Error" },
          { label: "RMSE", value: `${activeModel.rmse}`, unit: "veh/hr", desc: "Root Mean Squared Error" },
          { label: "MAPE", value: `${activeModel.mape}%`, unit: "", desc: "Mean Abs % Error" },
          { label: "R² Score", value: `${activeModel.r2}`, unit: "", desc: "Coefficient of Determination" },
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
            <h3 className="text-xl font-black uppercase" style={sg}>Forecast Volume</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5" style={mono}>
              Intersection: {selectedLocationLabel} | Horizon: {horizon} | Model: {activeModel.name} | Start: {forecastData?.meta?.start_timestamp ? new Date(forecastData.meta.start_timestamp).toLocaleString("en-CA", { timeZone: "America/Toronto" }) : "Current"} | 95% confidence interval
            </p>
            {!hasHistoricalActuals && (
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1" style={mono}>
                Historical actuals unavailable for selected start window.
              </p>
            )}
          </div>
          <div className="flex gap-4 text-[10px] font-bold" style={mono}>
            {hasHistoricalActuals && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black" /> <span>Actual</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ background: accent }} /> <span>Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ background: `${accent}20`, border: `1px dashed ${accent}` }} /> <span>CI Band</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            {hasHistoricalActuals && (
              <Area type="monotone" dataKey="actual" stroke="#000" fill="none" strokeWidth={2.5} dot={{ r: 3, fill: "#000" }} name="Actual" />
            )}
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
            data={modelComparison}
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
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-6" style={mono}>
            {activeModel.name} — top 10 features by permutation importance
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#000", strokeWidth: 2 }}
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
              than reactive traffic management. The best-performing model ({bestModel.name}, R² = {bestModel.r2})
              is selected based on cross-validated error metrics.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
