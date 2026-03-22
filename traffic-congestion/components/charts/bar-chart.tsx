"use client";

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
} from "recharts";

const ACCENT = "#ff3e00";

const tickStyle = { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700 };
const tooltipStyle = {
  background: "#000",
  border: "3px solid #000",
  fontFamily: "var(--font-roboto-mono)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  color: "#fff",
};

type BarSeries = {
  dataKey: string;
  name: string;
  color?: string;
};

type Props = {
  data: Record<string, unknown>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  yLabel?: string;
  layout?: "horizontal" | "vertical";
};

export function BrutalBarChart({
  data,
  xKey,
  series,
  height = 300,
  yLabel,
  layout = "vertical",
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        barGap={4}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
        {layout === "vertical" ? (
          <>
            <XAxis
              type="number"
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              label={
                yLabel
                  ? { value: yLabel, position: "insideBottom", offset: -5, style: tickStyle }
                  : undefined
              }
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
            />
            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              label={
                yLabel
                  ? { value: yLabel, angle: -90, position: "insideLeft", style: tickStyle }
                  : undefined
              }
            />
          </>
        )}
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: ACCENT, fontWeight: 900 }}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color ?? (i === 0 ? "#000" : ACCENT)}
            radius={[2, 2, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalComparisonChart({
  data,
}: {
  data: { label: string; baseline: number; optimized: number; unit: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 80 + 40}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} horizontal={false} />
        <XAxis
          type="number"
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
          width={120}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: ACCENT, fontWeight: 900 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }}
        />
        <Bar dataKey="baseline" name="Baseline" fill="#000" fillOpacity={0.15} radius={[0, 2, 2, 0]} maxBarSize={24}>
          {data.map((_, i) => (
            <Cell key={i} stroke="#000" strokeWidth={1.5} />
          ))}
        </Bar>
        <Bar dataKey="optimized" name="Optimized" fill={ACCENT} radius={[0, 2, 2, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
