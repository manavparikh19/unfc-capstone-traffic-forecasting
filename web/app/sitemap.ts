import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
export const dynamic = "force-static";

const routes = [
  "",
  "/dashboard",
  "/forecasting",
  "/signal-optimization",
  "/hotspots",
  "/route-planner",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
    lastModified: new Date(),
  }));
}
