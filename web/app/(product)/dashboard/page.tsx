import { DashboardView } from "@/features/dashboard/dashboard-view";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Traffic Intelligence Dashboard",
  description:
    "View congestion KPIs, peak and off-peak analysis, location-based filtering, and network reliability insights.",
  path: "/dashboard",
});

export default function DashboardRoute() {
  return <DashboardView />;
}
