import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Traffic Congestion",
    short_name: "TrafficIQ",
    description:
      "AI-powered smart-city traffic intelligence for forecasting congestion, optimizing signals, and planning future-aware routes.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
