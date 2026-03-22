"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RouteResultsPage } from "@/features/route-planner/route-results-page";
import { buildRoutePlan } from "@/server/services/route-service";
import { routePlanSchema } from "@/features/route-planner/schema";

function ResultsContent() {
  const searchParams = useSearchParams();
  
  const params = {
    origin: searchParams.get("origin") ?? undefined,
    destination: searchParams.get("destination") ?? undefined,
    departureDate: searchParams.get("departureDate") ?? undefined,
    departureTime: searchParams.get("departureTime") ?? undefined,
  };

  const parsed = routePlanSchema.safeParse(params);

  if (!parsed.success) {
    return (
      <RouteResultsPage
        input={{
          origin: "Downtown Core",
          destination: "Airport Corridor",
          departureDate: new Date().toISOString().slice(0, 10),
          departureTime: "08:30",
        }}
        routes={[]}
      />
    );
  }

  const routes = buildRoutePlan(parsed.data);
  return <RouteResultsPage input={parsed.data} routes={routes} />;
}

export default function ResultsClient() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold uppercase tracking-tighter">Calculating Optimal Pathways...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
