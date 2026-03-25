import { NextResponse } from "next/server";

import { routePlanSchema } from "@/features/route-planner/schema";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRoutePlan } from "@/server/services/route-service";

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "local";
  return `route-plan:${ip}`;
}

export async function POST(request: Request) {
  const limit = checkRateLimit(
    getClientKey(request),
    env.ROUTE_PLAN_RATE_LIMIT_MAX,
    60_000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        message:
          "Rate limit exceeded for route planning. Please retry shortly.",
      },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = routePlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid route planning request.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    routes: buildRoutePlan(parsed.data),
  });
}
