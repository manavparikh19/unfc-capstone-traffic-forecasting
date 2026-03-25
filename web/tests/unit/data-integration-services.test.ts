import { describe, expect, it } from "vitest";

import { getDashboardApiPayload } from "@/server/services/dashboard-service";
import { getHotspotApiPayload } from "@/server/services/hotspot-service";
import { getOptimizationApiPayload } from "@/server/services/optimization-service";

describe("CSV-backed integration services", () => {
  it("builds dashboard summary from processed datasets", async () => {
    const payload = await getDashboardApiPayload();

    expect(payload.areas.length).toBeGreaterThan(0);
    expect(payload.monthlyTrends.length).toBe(12);
    expect(payload.topHotspots.length).toBeGreaterThan(0);
    expect(payload.actualVsPredicted.length).toBeGreaterThan(0);
  });

  it("builds optimization payload with non-empty chart series", async () => {
    const payload = await getOptimizationApiPayload();

    expect(payload.metrics.length).toBeGreaterThan(0);
    expect(payload.timingPhases.length).toBeGreaterThan(0);
    expect(payload.vcRatio.length).toBeGreaterThan(0);
    expect(payload.trend.length).toBeGreaterThan(0);
  });

  it("builds hotspot payload with ranked locations", async () => {
    const payload = await getHotspotApiPayload();

    expect(payload.hotspots.length).toBeGreaterThan(0);
    expect(payload.hotspots[0]?.congestionScore).toBeGreaterThanOrEqual(
      payload.hotspots[1]?.congestionScore ?? 0,
    );
    expect(payload.avgSeverity).toBeGreaterThan(0);
  });
});
