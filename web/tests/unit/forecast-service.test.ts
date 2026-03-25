import { describe, expect, it } from "vitest";

import { getForecastApiPayload } from "@/server/services/forecast-service";

describe("getForecastApiPayload", () => {
  it("returns CSV-backed forecast data with ranked models", async () => {
    const payload = await getForecastApiPayload();

    expect(payload.models.length).toBeGreaterThan(0);
    expect(payload.hourlyData.length).toBeGreaterThan(0);
    expect(payload.bestModel.name).toBe(payload.models[0]?.name);
    expect(payload.models[0]?.mae).toBeLessThanOrEqual(
      payload.models[1]?.mae ?? Infinity,
    );
  });
});
