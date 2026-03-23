import { NextResponse } from "next/server";

import { getDashboardApiPayload } from "@/server/services/dashboard-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationId = url.searchParams.get("locationId");
  const peakParam = (url.searchParams.get("peakWindow") || "all").toLowerCase();
  const peakWindow =
    peakParam === "am" || peakParam === "pm" || peakParam === "offpeak"
      ? peakParam
      : "all";
  try {
    const payload = await getDashboardApiPayload(locationId, peakWindow);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load dashboard summary." },
      { status: 500 },
    );
  }
}
