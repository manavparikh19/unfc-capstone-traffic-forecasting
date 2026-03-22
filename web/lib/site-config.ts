export const siteConfig = {
  name: "Traffic Congestion",
  shortName: "TrafficIQ",
  description:
    "AI-powered traffic intelligence for congestion forecasting, signal optimization, and future-aware route planning.",
  creator: "Traffic Congestion",
  baseNavigation: [
    { href: "/", label: "Overview" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/forecasting", label: "Forecasting" },
    { href: "/signal-optimization", label: "Signal Optimization" },
    { href: "/hotspots", label: "Hotspots" },
    { href: "/route-planner", label: "Route Planner" },
    { href: "/about", label: "Methodology" },
    { href: "/contact", label: "Request Demo" },
  ],
  socialPreviewHeadline:
    "Future-aware traffic intelligence for smarter urban mobility.",
};

export const cityFocusAreas = [
  "Downtown Core",
  "Harbourfront",
  "Midtown Loop",
  "Innovation District",
  "Airport Corridor",
  "University Belt",
  "Industrial East",
  "Riverside North",
] as const;

export type CityArea = (typeof cityFocusAreas)[number];
