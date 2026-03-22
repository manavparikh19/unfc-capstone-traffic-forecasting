"use client";

const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

type ComparisonMetric = {
  label: string;
  baseline: number;
  optimized: number;
  unit: string;
};

export function ComparisonBars({ metrics }: { metrics: ComparisonMetric[] }) {
  return (
    <div className="space-y-8">
      {metrics.map((metric) => {
        const max = Math.max(metric.baseline, metric.optimized);
        return (
          <div key={metric.label} className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-black uppercase tracking-tight">{metric.label}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase" style={mono}>
                {metric.unit}
              </span>
            </div>
            <div className="space-y-2">
              {/* Baseline Bar */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-[10px] font-bold uppercase text-slate-400" style={mono}>
                  Baseline
                </span>
                <div className="h-6 flex-1 brutal-border bg-white overflow-hidden">
                  <div
                    className="h-full bg-black/10 transition-all duration-500"
                    style={{ width: `${(metric.baseline / max) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-black" style={mono}>
                  {metric.baseline}
                </span>
              </div>
              {/* Optimized Bar */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-[10px] font-bold uppercase text-slate-400" style={mono}>
                  Optimized
                </span>
                <div className="h-6 flex-1 brutal-border bg-white overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${(metric.optimized / max) * 100}%`,
                      background: accent
                    }}
                  />
                  {/* Stripes for emphasis */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                      backgroundSize: '8px 8px'
                    }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-black" style={{ ...mono, color: accent }}>
                  {metric.optimized}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
