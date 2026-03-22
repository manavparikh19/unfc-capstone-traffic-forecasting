"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Navigation as NavIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cityFocusAreas } from "@/lib/site-config";
import {
  routePlanSchema,
  type RoutePlanInput,
} from "@/features/route-planner/schema";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

function nextQuarterHour() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  now.setSeconds(0, 0);

  const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
  now.setMinutes(roundedMinutes);

  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  };
}

export function RoutePlannerForm() {
  const router = useRouter();
  const defaults = nextQuarterHour();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoutePlanInput>({
    resolver: zodResolver(routePlanSchema),
    defaultValues: {
      origin: "Downtown Core",
      destination: "Airport Corridor",
      departureDate: defaults.date,
      departureTime: defaults.time,
    },
  });

  const onSubmit = (values: RoutePlanInput) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      params.append(key, value as string);
    });
    router.push(`/route-planner/results?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 px-4 lg:px-8 py-10 space-y-10" 
      style={sg}
    >
      
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] whitespace-normal sm:whitespace-nowrap"
            style={sg}
          >
            Route Planner
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span
            className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1 leading-none"
            style={{ ...mono, background: "#000" }}
          >
            Module: PREDICTIVE_NAV_PROTOTYPE
          </span>
          <span
            className="text-[10px] uppercase font-bold mt-1 leading-tight"
            style={{ ...mono, color: "#64748b" }}
          >
            V.2.1-DEMO
          </span>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Input Form (8 cols) */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="brutal-border bg-white p-8 lg:p-12 brutal-shadow"
          >
            <h3 className="text-2xl font-black uppercase mb-8 pb-4 border-b-4 border-black" style={sg}>
              Configure Future Trip
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Origin */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
                    Departure Point (Origin)
                  </label>
                  <select
                    {...register("origin")}
                    className="w-full brutal-border bg-white p-3 font-bold uppercase text-sm focus:ring-0"
                    style={mono}
                  >
                    {cityFocusAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  {errors.origin && <p className="text-[10px] text-accent font-black uppercase" style={{ ...mono, color: accent }}>{errors.origin.message}</p>}
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
                    Arrival Point (Destination)
                  </label>
                  <select
                    {...register("destination")}
                    className="w-full brutal-border bg-white p-3 font-bold uppercase text-sm focus:ring-0"
                    style={mono}
                  >
                    {cityFocusAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  {errors.destination && <p className="text-[10px] text-accent font-black uppercase" style={{ ...mono, color: accent }}>{errors.destination.message}</p>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
                    Plan Date
                  </label>
                  <input
                    type="date"
                    {...register("departureDate")}
                    className="w-full brutal-border bg-white p-3 font-bold uppercase text-sm focus:ring-0"
                    style={mono}
                  />
                  {errors.departureDate && <p className="text-[10px] text-accent font-black uppercase" style={{ ...mono, color: accent }}>{errors.departureDate.message}</p>}
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
                    Proposed Departure
                  </label>
                  <input
                    type="time"
                    {...register("departureTime")}
                    className="w-full brutal-border bg-white p-3 font-bold uppercase text-sm focus:ring-0"
                    style={mono}
                  />
                  {errors.departureTime && <p className="text-[10px] text-accent font-black uppercase" style={{ ...mono, color: accent }}>{errors.departureTime.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t-3 border-black">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full brutal-border text-white p-4 font-black uppercase tracking-widest text-lg brutal-shadow-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
                  style={{ ...sg, backgroundColor: accent }}
                >
                  {isSubmitting ? "Calculating Routes..." : "Optimize Future Route"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right: Scoring Info (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="brutal-border p-8 bg-black text-white space-y-6"
          >
            <h3 className="text-xl font-black uppercase" style={sg}>How Scoring Works</h3>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <CalendarClock className="size-6 shrink-0" style={{ color: accent }} />
                  <div>
                    <h4 className="text-xs font-black uppercase mb-1" style={mono}>Predictive Demand</h4>
                    <p className="text-[10px] uppercase font-bold text-white/40 leading-relaxed" style={mono}>
                      We use departure-time demand uplift to estimate hallway saturation before you even leave.
                    </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <NavIcon className="size-6 shrink-0" style={{ color: accent }} />
                  <div>
                    <h4 className="text-xs font-black uppercase mb-1" style={mono}>Corridor Resilience</h4>
                    <p className="text-[10px] uppercase font-bold text-white/40 leading-relaxed" style={mono}>
                      Routes are ranked by their ability to absorb demand surges without total network collapse.
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="brutal-border p-8 bg-white space-y-4"
          >
             <h3 className="text-xl font-black uppercase" style={sg}>Engine Status</h3>
             <div className="space-y-2" style={mono}>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase border-b border-black/5 pb-2">
                   <span>Provider</span>
                   <span className="text-slate-400">CITY_LAB_V1</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase border-b border-black/5 pb-2">
                   <span>Latency</span>
                   <span className="text-slate-400">42MS</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                   <span>Accuracy</span>
                   <span style={{ color: accent }}>98.4%</span>
                </div>
             </div>
          </motion.div>

          <div className="p-4 bg-slate-100 brutal-border border-dashed">
             <p className="text-[9px] font-bold uppercase text-slate-500 leading-relaxed" style={mono}>
                Prototype mode: Using local blueprint logic. External routing APIs (Mapbox/Google) can be integrated via the existing service boundaries.
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
