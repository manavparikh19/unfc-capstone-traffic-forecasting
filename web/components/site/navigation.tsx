"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { siteConfig } from "@/lib/site-config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/forecasting", label: "Forecasting" },
  { href: "/signal-optimization", label: "Signal Opt." },
  { href: "/hotspots", label: "Hotspots" },
  { href: "/route-planner", label: "Scenarios" },
  { href: "/about", label: "Methodology" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 brutal-border bg-white mx-4 mt-4 lg:mx-8">
      <div className="flex flex-wrap items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 brutal-border flex items-center justify-center"
            style={{ background: "#ff3e00" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 3h4l1.5 9 1-5h5l1 5 1.5-9H21v2h-1.5L18 15h-2l-1-5h-2l-1 5H10L8.5 5H7V3z" />
              <circle cx="7" cy="19" r="2" />
              <circle cx="17" cy="19" r="2" />
            </svg>
          </div>
          <Link href="/">
            <h1 className="text-xl font-black tracking-tighter uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {siteConfig.name}
            </h1>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1 text-xs uppercase font-bold" style={{ fontFamily: "var(--font-roboto-mono)" }}>
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 transition-all hover:bg-black hover:text-white"
                style={{
                  background: active ? "#000" : "transparent",
                  color: active ? "#fff" : "#000",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="brutal-border brutal-shadow-sm px-6 py-2 font-black uppercase text-sm hidden sm:block transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none bg-white"
            style={{ fontFamily: "var(--font-roboto-mono)" }}
          >
            Access Portal
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="brutal-border p-2 xl:hidden bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-black overflow-hidden xl:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-6" style={{ fontFamily: "var(--font-roboto-mono)" }}>
              {navLinks.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-4 text-sm font-bold uppercase transition-colors"
                    style={{ background: active ? "#000" : "transparent", color: active ? "#fff" : "#000" }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-4 px-4 py-4 text-sm font-black uppercase bg-accent text-white"
              >
                Access Portal
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
