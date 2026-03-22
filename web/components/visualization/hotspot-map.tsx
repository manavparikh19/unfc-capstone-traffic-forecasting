"use client";

import type { Hotspot } from "@/features/traffic/data/demo-data";

const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

export function HotspotMap({ items }: { items: Hotspot[] }) {
  return (
    <div className="relative min-h-[500px] w-full bg-white overflow-hidden">
      {/* Brutalist coordinate grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Road skeleton representation (Brutalist style) */}
      <div className="absolute top-[20%] left-[10%] right-[10%] h-px bg-black/10" />
      <div className="absolute top-[50%] left-[10%] right-[10%] h-px bg-black/10" />
      <div className="absolute top-[80%] left-[10%] right-[10%] h-px bg-black/10" />
      
      <div className="absolute left-[20%] top-[10%] bottom-[10%] w-px bg-black/10" />
      <div className="absolute left-[50%] top-[10%] bottom-[10%] w-px bg-black/10" />
      <div className="absolute left-[80%] top-[10%] bottom-[10%] w-px bg-black/10" />

      {items.map((item) => {
        const isCritical = item.severity === "Critical";
        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            style={{
              left: `${item.coordinates.x}%`,
              top: `${item.coordinates.y}%`,
            }}
          >
            {/* Hotspot node: Brutalist circle with bold border */}
            <div 
              className="relative w-10 h-10 brutal-border rounded-full flex items-center justify-center transition-all bg-white group-hover:scale-110"
              style={{
                borderColor: isCritical ? accent : "#000",
                boxShadow: isCritical ? `4px 4px 0px 0px ${accent}` : "2px 2px 0px 0px #000"
              }}
            >
              <div 
                className="text-[10px] font-black"
                style={{ ...mono, color: isCritical ? accent : "#000" }}
              >
                {item.congestionScore}
              </div>
            </div>
            
            {/* Tooltip on hover (Brutalist style) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              <div className="brutal-border bg-black text-white px-2 py-1 text-[8px] font-bold uppercase" style={mono}>
                {item.name} | SEV_{item.severity.toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
