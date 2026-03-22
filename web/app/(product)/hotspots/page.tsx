import { HotspotExplorerPage } from "@/features/hotspots/hotspot-explorer-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Congestion Hotspot Explorer",
  description:
    "Explore ranked congestion hotspots, severity bands, map-style hotspot UI, and improvement opportunities by location.",
  path: "/hotspots",
});

export default function HotspotsRoute() {
  return <HotspotExplorerPage />;
}
