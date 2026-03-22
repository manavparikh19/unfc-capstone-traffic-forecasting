"use client";

import { cn } from "@/lib/utils";

type SparklinePoint = {
  label: string;
  actual: number;
  predicted?: number;
  optimized?: number;
};

const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

function buildPath(points: number[], width: number, height: number) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function SparklineChart({
  points,
  compareKey,
  className,
}: {
  points: SparklinePoint[];
  compareKey?: "predicted" | "optimized";
  className?: string;
}) {
  const width = 800; // Increased width for better scaling
  const height = 240;
  
  const actualValues = points.map((p) => p.actual);
  const actualPath = buildPath(actualValues, width, height);
  
  const compareValues = compareKey ? points.map((p) => p[compareKey] ?? p.actual) : null;
  const comparePath = compareValues ? buildPath(compareValues, width, height) : null;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative">
        {/* SVG Container with Brutalist Border/Background */}
        <div className="brutal-border bg-white p-4 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 lg:h-64 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1="0"
                x2={width}
                y1={height * f}
                y2={height * f}
                stroke="black"
                strokeWidth="0.5"
                strokeOpacity="0.1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Compare Line (Optimized/Predicted) - Thick Red */}
            {comparePath && (
              <path
                d={comparePath}
                fill="none"
                stroke={accent}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Actual Line - Thick Black */}
            <path
              d={actualPath}
              fill="none"
              stroke="black"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeOpacity={comparePath ? 0.2 : 1}
            />

            {/* Data Points for Compare Line */}
            {compareValues && compareValues.map((v, i) => {
               const x = (i / (compareValues.length - 1)) * width;
               const y = height - ((v - Math.min(...compareValues)) / (Math.max(...compareValues) - Math.min(...compareValues) || 1)) * height;
               return (
                 <circle key={i} cx={x} cy={y} r="4" fill={accent} className="brutal-border" style={{ stroke: 'black', strokeWidth: 1.5 }} />
               );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4" style={mono}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-0.5 bg-black/20" />
            <span className="text-[10px] font-bold uppercase">Baseline</span>
          </div>
          {compareKey && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-0.5 bg-accent" />
              <span className="text-[10px] font-bold uppercase">{compareKey.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between px-2">
        {points.map((point) => (
          <span key={point.label} className="text-[10px] font-bold uppercase text-slate-500" style={mono}>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
