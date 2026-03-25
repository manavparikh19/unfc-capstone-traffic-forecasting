import { routeBlueprints } from "@/features/traffic/data/demo-data";
import type { RoutePlanInput } from "@/features/route-planner/schema";

export type PlannedRoute = {
  id: string;
  name: string;
  description: string;
  via: string[];
  travelTimeMin: number;
  distanceKm: number;
  congestionScore: number;
  confidence: number;
  rationale: string;
};

function calculatePeakMultiplier(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes >= 420 && totalMinutes <= 570) {
    return 1.28;
  }

  if (totalMinutes >= 960 && totalMinutes <= 1110) {
    return 1.31;
  }

  if (totalMinutes >= 690 && totalMinutes <= 840) {
    return 0.94;
  }

  return 1.08;
}

function calculateWeekendMultiplier(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6 ? 0.9 : 1;
}

function keyForPlan(origin: string, destination: string) {
  return `${origin}:${destination}`;
}

function reverseKeyForPlan(origin: string, destination: string) {
  return `${destination}:${origin}`;
}

export function buildRoutePlan(input: RoutePlanInput) {
  const candidates =
    routeBlueprints[keyForPlan(input.origin, input.destination)] ??
    routeBlueprints[reverseKeyForPlan(input.origin, input.destination)];

  if (!candidates) {
    return [];
  }

  const peakMultiplier = calculatePeakMultiplier(input.departureTime);
  const weekendMultiplier = calculateWeekendMultiplier(input.departureDate);

  return candidates
    .map((route, index) => {
      const corridorSensitivity = 1 + (100 - route.resilienceScore) / 250;
      const travelTimeMin = Math.round(
        route.baseDurationMin *
          peakMultiplier *
          weekendMultiplier *
          corridorSensitivity,
      );
      const congestionScore = Math.min(
        96,
        Math.round(48 * peakMultiplier * corridorSensitivity),
      );
      const confidence = Math.max(
        72,
        Math.round(
          route.resilienceScore - peakMultiplier * 8 + (index === 0 ? 6 : 0),
        ),
      );

      return {
        id: route.id,
        name: route.name,
        description: route.description,
        via: route.via,
        travelTimeMin,
        distanceKm: route.distanceKm,
        congestionScore,
        confidence,
        rationale:
          route.resilienceScore >= 85
            ? "Favored for consistent travel time under predicted demand spikes."
            : "Useful alternative when the primary corridor is already saturated.",
      } satisfies PlannedRoute;
    })
    .sort((a, b) => {
      if (a.travelTimeMin === b.travelTimeMin) {
        return a.congestionScore - b.congestionScore;
      }

      return a.travelTimeMin - b.travelTimeMin;
    });
}
