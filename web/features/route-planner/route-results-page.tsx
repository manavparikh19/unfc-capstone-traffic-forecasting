"use client";

import { motion } from "framer-motion";
import { Clock, Gauge, Shovel, ShieldCheck, ArrowRight, Route } from "lucide-react";
import Link from "next/link";
import type { RoutePlanInput } from "@/features/route-planner/schema";
import type { PlannedRoute } from "@/server/services/route-service";
import { formatDistanceKm, formatMinutes } from "@/lib/format";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

export function RouteResultsPage({
  input,
  routes,
}: {
  input: RoutePlanInput;
  routes: PlannedRoute[];
}) {
  if (routes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 px-4 lg:px-8 py-12" 
        style={sg}
      >
         <div className="brutal-border bg-white p-12 text-center space-y-8 brutal-shadow">
            <h1 className="text-4xl font-black uppercase tracking-tighter" style={sg}>Zero Blueprint Matches Found</h1>
            <p className="text-sm font-bold uppercase text-slate-500 max-w-xl mx-auto" style={mono}>
              The prototype currently handles curated corridor pairs. Try: <br/> 
              <span className="text-black">Downtown Core → Airport Corridor</span>
            </p>
            <Link href="/route-planner" className="inline-block brutal-border bg-black text-white px-8 py-3 text-sm font-black uppercase brutal-shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5" style={sg}>
               Back to Planner
            </Link>
         </div>
      </motion.div>
    );
  }

  const [bestRoute, ...alternatives] = routes;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-12" 
      style={sg}
    >
      
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] whitespace-normal sm:whitespace-nowrap"
            style={sg}
          >
            {input.origin} → {input.destination}
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span
             className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1 leading-none"
             style={{ ...mono, background: "#000" }}
          >
             Origin: {input.origin}
          </span>
          <span
            className="text-[10px] uppercase font-bold mt-1 leading-tight"
            style={{ ...mono, color: "#64748b" }}
          >
            Destination: {input.destination}
          </span>
        </div>
      </div>

      {/* ── Best Recommended Route ────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="brutal-border bg-white p-8 lg:p-12 brutal-shadow relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 px-6 py-2 bg-black text-white text-xs font-black uppercase" style={mono}>
           Recommended_Primary
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
           {/* Left Info */}
           <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter" style={sg}>
                  {bestRoute.name}
                </h2>
                <div className="flex items-center gap-4 mt-6 flex-wrap">
                   <div className="flex items-center gap-2 border-r-2 border-black/10 pr-4">
                      <Clock className="size-5" />
                      <span className="text-xl font-bold" style={mono}>{formatMinutes(bestRoute.travelTimeMin)}</span>
                   </div>
                   <div className="flex items-center gap-2 border-r-2 border-black/10 pr-4">
                      <Gauge className="size-5" />
                      <span className="text-xl font-bold" style={mono}>{formatDistanceKm(bestRoute.distanceKm)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <ShieldCheck className="size-5" />
                       <span className="text-xl font-bold uppercase" style={sg}>{bestRoute.confidence}% Confidence</span>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-black text-white space-y-4 brutal-border">
                 <h4 className="text-xs font-black uppercase text-accent" style={mono}>Technical Rationale</h4>
                 <p className="text-sm uppercase font-bold leading-relaxed opacity-60" style={mono}>
                    {bestRoute.description} {bestRoute.rationale}
                 </p>
                 <div className="pt-4 border-t border-white/20">
                    <span className="text-[9px] font-bold uppercase text-white/30 block mb-2" style={mono}>Segment Blueprint</span>
                    <p className="text-[10px] font-black uppercase tracking-wide gap-2 flex items-center flex-wrap" style={mono}>
                       {bestRoute.via.map((v, i) => (
                          <span key={v} className="flex items-center gap-2">
                             {v} {i < bestRoute.via.length - 1 && <ArrowRight className="size-3" style={{ color: accent }} />}
                          </span>
                       ))}
                    </p>
                 </div>
              </div>
           </div>

           {/* Right KPIs */}
           <div className="lg:col-span-4 flex flex-col justify-between gap-6">
              {[
                { label: "Congestion Score", value: bestRoute.congestionScore, color: bestRoute.congestionScore > 60 ? accent : "#15803d" },
                { label: "Stress Level", value: bestRoute.congestionScore > 50 ? "High" : "Nominal", color: "#000" },
                { label: "Predictive Hit", value: `${bestRoute.confidence}%`, color: accent }
              ].map(kpi => (
                <div key={kpi.label} className="brutal-border p-6 bg-slate-50">
                   <div className="text-[10px] font-bold uppercase text-slate-500 mb-1" style={mono}>{kpi.label}</div>
                   <div className="text-3xl font-black uppercase" style={{ ...sg, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
           </div>
        </div>
      </motion.div>

      {/* ── Alternatives ─────────────────────────────────── */}
      <div className="space-y-8">
         <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-4 inline-block" style={sg}>Alternative Profiles</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alternatives.map((route, i) => (
              <motion.div 
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="brutal-border bg-white p-6 brutal-shadow-sm group hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                   <h4 className="text-xl font-black uppercase leading-tight" style={sg}>{route.name}</h4>
                   <span className="text-[10px] font-black underline underline-offset-4" style={mono}>{formatMinutes(route.travelTimeMin)}</span>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <Shovel className="size-3 text-slate-400" />
                      <span className="text-[10px] uppercase font-bold text-slate-500 line-clamp-1" style={mono}>
                         Path: {formatDistanceKm(route.distanceKm)} Linear Dist
                      </span>
                   </div>
                   <p className="text-[10px] uppercase font-bold leading-relaxed opacity-50" style={mono}>
                      {route.description}
                   </p>
                </div>
                <div className="mt-8 pt-6 border-t border-black/5 grid grid-cols-2 gap-4">
                    <div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase">Confidence</div>
                       <div className="text-lg font-black" style={mono}>{route.confidence}%</div>
                    </div>
                    <div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase">Congestion</div>
                       <div className="text-lg font-black" style={{ ...mono, color: route.congestionScore > 60 ? accent : 'inherit' }}>{route.congestionScore}</div>
                    </div>
                </div>
              </motion.div>
            ))}
         </div>
      </div>

    </motion.div>
  );
}
