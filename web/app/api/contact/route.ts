import { NextResponse } from "next/server";

import { contactRequestSchema } from "@/features/contact/schema";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitContactRequest } from "@/server/services/contact-service";

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "local";
  return `contact:${ip}`;
}

export async function POST(request: Request) {
  const limit = checkRateLimit(
    getClientKey(request),
    env.CONTACT_RATE_LIMIT_MAX,
    60_000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        message: "Too many requests. Please wait a minute and try again.",
      },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = contactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please review the form fields and try again.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const result = await submitContactRequest(parsed.data);
  return NextResponse.json(result, { status: 200 });
}
