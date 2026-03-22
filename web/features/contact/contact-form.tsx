"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Mail, Building, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  contactRequestSchema,
  type ContactRequest,
} from "@/features/contact/schema";

const sg = { fontFamily: "var(--font-space-grotesk)" } as const;
const mono = { fontFamily: "var(--font-roboto-mono)" } as const;
const accent = "#ff3e00";

export function ContactForm() {
  const [submissionState, setSubmissionState] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactRequest>({
    resolver: zodResolver(contactRequestSchema),
  });

  const onSubmit = async (values: ContactRequest) => {
    setSubmissionState({ type: "idle" });

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSubmissionState({
        type: "error",
        message: payload.message ?? "We could not submit your request.",
      });
      return;
    }

    reset();
    setSubmissionState({
      type: "success",
      message: payload.message,
    });
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
            Access Portal
          </h1>
          <div className="h-1 flex-1 bg-black hidden lg:block" />
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span
            className="text-[10px] sm:text-xs uppercase font-black text-white px-2 py-1 leading-none"
            style={{ ...mono, background: "#000" }}
          >
            Gate: GATEWAY_SECURE_V4
          </span>
          <span
            className="text-[10px] uppercase font-bold mt-1 leading-tight"
            style={{ ...mono, color: "#64748b" }}
          >
            Status: LISTENING_FOR_PROPOSALS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Branding & Info (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="brutal-border bg-black text-white p-8 lg:p-12 brutal-shadow space-y-8 relative overflow-hidden"
           >
               {/* Pattern */}
               <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                      backgroundSize: "20px 20px"
                    }}
               />
               <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                     <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight" style={sg}>Request Platform Deployment</h2>
                     <p className="text-sm uppercase font-bold text-white/50 leading-relaxed" style={mono}>
                        This form initiates a validated request for a tailored platform walkthrough. 
                        Submissions are handled via secure endpoint V4.
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                        { icon: ShieldCheck, label: "Secure Validation" },
                        { icon: Building, label: "Org-Specific Models" },
                        { icon: Mail, label: "Direct response < 24h" }
                     ].map((item, i) => (
                        <motion.div 
                          key={item.label} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (i * 0.1) }}
                          className="flex items-center gap-4 p-4 brutal-border border-white/20 bg-white/5"
                        >
                           <item.icon className="size-5 shrink-0" style={{ color: accent }} />
                           <span className="text-[10px] font-black uppercase tracking-wider" style={mono}>{item.label}</span>
                        </motion.div>
                     ))}
                  </div>
               </div>
           </motion.div>

           <div className="p-6 bg-slate-50 brutal-border border-dashed">
              <p className="text-[10px] font-bold uppercase text-slate-400 leading-relaxed" style={mono}>
                 Note: Demo access is provided to accredited municipalities and mobility stakeholders only. 
                 Prototype mode active.
              </p>
           </div>
        </div>

        {/* Right: Form (7 cols) */}
        <div className="lg:col-span-7">
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="brutal-border bg-white p-8 lg:p-12 brutal-shadow space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2" style={mono}>
                   <User className="size-3" /> Full Name
                </label>
                <input
                  {...register("name")}
                  placeholder="JORDAN LEE"
                  className="w-full brutal-border bg-white p-4 font-black uppercase text-sm focus:ring-0 placeholder:text-slate-300 transition-all focus:border-red-500"
                  style={mono}
                />
                {errors.name && <p className="text-[10px] text-accent font-black uppercase" style={mono}>{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2" style={mono}>
                   <Mail className="size-3" /> Work Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="JORDAN@CITYLAB.IO"
                  className="w-full brutal-border bg-white p-4 font-black uppercase text-sm focus:ring-0 placeholder:text-slate-300 transition-all focus:border-red-500"
                  style={mono}
                />
                {errors.email && <p className="text-[10px] text-accent font-black uppercase" style={mono}>{errors.email.message}</p>}
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2" style={mono}>
                   <Building className="size-3" /> Organization
                </label>
                <input
                  {...register("company")}
                  placeholder="CITY MOBILITY OFFICE"
                  className="w-full brutal-border bg-white p-4 font-black uppercase text-sm focus:ring-0 placeholder:text-slate-300 transition-all focus:border-red-500"
                  style={mono}
                />
                {errors.company && <p className="text-[10px] text-accent font-black uppercase" style={mono}>{errors.company.message}</p>}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2" style={mono}>
                   Role / Department
                </label>
                <input
                  {...register("role")}
                  placeholder="TRANSPO ANALYST"
                  className="w-full brutal-border bg-white p-4 font-black uppercase text-sm focus:ring-0 placeholder:text-slate-300 transition-all focus:border-red-500"
                  style={mono}
                />
                {errors.role && <p className="text-[10px] text-accent font-black uppercase" style={mono}>{errors.role.message}</p>}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500" style={mono}>
                What do you want to evaluate?
              </label>
              <textarea
                {...register("message")}
                rows={5}
                placeholder="WE WANT TO COMPARE PREDICTED CONGESTION AGAINST OUR CORE CORRIDORS..."
                className="w-full brutal-border bg-white p-4 font-black uppercase text-sm focus:ring-0 placeholder:text-slate-300 resize-none transition-all focus:border-red-500"
                style={mono}
              />
              {errors.message && <p className="text-[10px] text-accent font-black uppercase" style={mono}>{errors.message.message}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t-3 border-black flex flex-col items-end gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full brutal-border bg-accent text-white p-5 font-black uppercase tracking-widest text-lg brutal-shadow-sm transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
                style={sg}
              >
                {isSubmitting ? "PROCESSING REQUEST..." : "SUBMIT ACCESS PROPOSAL"}
              </button>
              
              <AnimatePresence>
                {submissionState.type !== "idle" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full brutal-border p-4 text-xs font-black uppercase text-center"
                    style={{
                      backgroundColor: submissionState.type === "success" ? "#dcfce7" : "#fee2e2",
                      borderColor: submissionState.type === "success" ? "#15803d" : "#ef4444",
                      color: submissionState.type === "success" ? "#15803d" : "#ef4444",
                      ...mono
                    }}
                  >
                    {submissionState.message || (submissionState.type === "success" ? "Proposal Received Successfully." : "Submission Error Detected.")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
}
