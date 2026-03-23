import { NextResponse } from "next/server";

import { getHotspotApiPayload } from "@/server/services/hotspot-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getHotspotApiPayload();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load hotspot data." },
      { status: 500 },
    );
  }
}
