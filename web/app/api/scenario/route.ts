import { NextResponse } from "next/server";

import type { ScenarioInput } from "@/lib/api";
import { getScenarioHistory, simulateScenario } from "@/server/services/scenario-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const history = await getScenarioHistory(6);
    return NextResponse.json({ history });
  } catch {
    return NextResponse.json(
      { message: "Unable to load scenario history." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ScenarioInput>;
    const input: ScenarioInput = {
      trafficSurge: Number(body.trafficSurge ?? 0),
      hasIncident: Boolean(body.hasIncident),
      weatherCondition:
        body.weatherCondition === "rain" || body.weatherCondition === "snow"
          ? body.weatherCondition
          : "clear",
      timingStrategy:
        body.timingStrategy === "adaptive" || body.timingStrategy === "actuated"
          ? body.timingStrategy
          : "fixed",
      demandLevel:
        body.demandLevel === "low" ||
        body.demandLevel === "high" ||
        body.demandLevel === "extreme"
          ? body.demandLevel
          : "normal",
    };
    const payload = await simulateScenario(input);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to run scenario simulation." },
      { status: 500 },
    );
  }
}

