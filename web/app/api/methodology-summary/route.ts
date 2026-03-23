import { NextResponse } from "next/server";

import { getMethodologySummary } from "@/server/services/methodology-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getMethodologySummary();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to load methodology summary." },
      { status: 500 },
    );
  }
}

