import { describe, expect, it } from "vitest";

import { getForecastSnapshot } from "@/server/services/traffic-service";

describe("getForecastSnapshot", () => {
  it("orders models by the lowest forecast error first", () => {
    const snapshot = getForecastSnapshot();

    expect(snapshot.bestModel.name).toBe("Temporal Fusion Transformer");
    expect(snapshot.models[0]?.mae).toBeLessThan(
      snapshot.models[1]?.mae ?? Infinity,
    );
  });
});
