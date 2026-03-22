import { createMetadata } from "@/lib/metadata";
import ResultsClient from "./results-client";

export const metadata = createMetadata({
  title: "Route Results",
  description:
    "See the best route, alternates, ETA, congestion score, and reasoning behind the route recommendation.",
  path: "/route-planner/results",
});

export default function RouteResultsRoute() {
  return <ResultsClient />;
}
