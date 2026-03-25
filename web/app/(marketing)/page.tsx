import { HomePage } from "@/features/home/home-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "AI-Powered Traffic Intelligence Platform",
  description:
    "Analyze traffic patterns, forecast future congestion, optimize signals, and prototype future-aware route planning with a premium smart-city SaaS experience.",
  path: "/",
});

export default function HomeRoute() {
  return <HomePage />;
}
