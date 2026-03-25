import { ScenarioTestingPage } from "@/features/route-planner/scenario-testing-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Scenario Testing",
  description:
    "Run what-if scenarios for traffic surges, incidents, weather events, and signal timing strategies.",
  path: "/route-planner",
});

export default function ScenarioTestingRoute() {
  return <ScenarioTestingPage />;
}
