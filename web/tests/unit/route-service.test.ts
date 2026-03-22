import { describe, expect, it } from "vitest";

import { buildRoutePlan } from "@/server/services/route-service";

describe("buildRoutePlan", () => {
  it("returns ranked routes for supported origin and destination pairs", () => {
    const routes = buildRoutePlan({
      origin: "Downtown Core",
      destination: "Airport Corridor",
      departureDate: "2026-03-16",
      departureTime: "08:30",
    });

    expect(routes.length).toBeGreaterThan(1);
    expect(routes[0]?.travelTimeMin).toBeLessThanOrEqual(
      routes[1]?.travelTimeMin ?? Infinity,
    );
    expect(routes[0]?.confidence).toBeGreaterThanOrEqual(72);
  });

  it("returns no routes for unsupported pairs", () => {
    const routes = buildRoutePlan({
      origin: "Airport Corridor",
      destination: "Riverside North",
      departureDate: "2026-03-16",
      departureTime: "09:00",
    });

    expect(routes).toEqual([]);
  });
});
