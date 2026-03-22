"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
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

type LineSeries = {
  dataKey: string;
  name: string;
  color?: string;
  dashed?: boolean;
  strokeWidth?: number;
};

type Props = {
  data: Record<string, unknown>[];
  xKey: string;
  series: LineSeries[];
  height?: number;
  yLabel?: string;
  referenceLineY?: number;
  referenceLabel?: string;
};

export function BrutalLineChart({
  data,
  xKey,
  series,
  height = 300,
  yLabel,
  referenceLineY,
  referenceLabel,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.06} />
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
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: ACCENT, fontWeight: 900 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, textTransform: "uppercase" }}
        />
        {referenceLineY !== undefined && (
          <ReferenceLine
            y={referenceLineY}
            stroke={ACCENT}
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: referenceLabel ?? "",
              position: "right",
              style: { fontSize: 10, fontFamily: "var(--font-roboto-mono)", fontWeight: 700, fill: ACCENT },
            }}
          />
        )}
        {series.map((s, i) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color ?? (i === 0 ? "#000" : ACCENT)}
            strokeWidth={s.strokeWidth ?? 2.5}
            strokeDasharray={s.dashed ? "6 3" : undefined}
            dot={{ r: 3, stroke: "#000", strokeWidth: 1.5, fill: s.color ?? (i === 0 ? "#000" : ACCENT) }}
            activeDot={{ r: 6, stroke: "#000", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
