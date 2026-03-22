"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

type AreaSeries = {
  dataKey: string;
  name: string;
  color?: string;
  fillOpacity?: number;
  dashed?: boolean;
};

type Props = {
  data: Record<string, unknown>[];
  xKey: string;
  series: AreaSeries[];
  height?: number;
  yLabel?: string;
};

export function BrutalAreaChart({
  data,
  xKey,
  series,
  height = 300,
  yLabel,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
        <XAxis
          dataKey={xKey}
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
        />
        <YAxis
          label={
            yLabel
              ? { value: yLabel, angle: -90, position: "insideLeft", style: tickStyle }
              : undefined
          }
          tick={tickStyle}
          tickLine={false}
          axisLine={{ stroke: "#000", strokeWidth: 2 }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: ACCENT, fontWeight: 900 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }}
        />
        {series.map((s) => (
          <Area
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? ACCENT}
            fill={s.color ?? ACCENT}
            fillOpacity={s.fillOpacity ?? 0.1}
            strokeWidth={2.5}
            strokeDasharray={s.dashed ? "6 3" : undefined}
            dot={false}
            activeDot={{ r: 5, stroke: "#000", strokeWidth: 2, fill: s.color ?? ACCENT }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
