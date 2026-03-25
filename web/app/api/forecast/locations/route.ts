import { NextResponse } from "next/server";

import { getForecastLocationOptions } from "@/server/services/forecast-service";

export async function GET() {
  try {
    const locations = await getForecastLocationOptions();
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json(
      { message: "Unable to load forecast locations." },
      { status: 500 },
    );
  }
}
