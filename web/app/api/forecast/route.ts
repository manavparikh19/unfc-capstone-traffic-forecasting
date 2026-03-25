import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getForecastApiPayload } from "@/server/services/forecast-service";

const intersectionToLocationId: Record<string, string> = {
  "King St x Spadina Ave": "10133019_NB",
  "Front St x Bay St": "913150_WB",
  "Eglinton Ave x Yonge": "8417204_WB",
  "University Ave x College": "913167_EB",
};

async function getServedForecast(
  locationId: string,
  horizonHours: number,
  modelName: string | null,
  startTimestamp: string | null,
): Promise<unknown> {
  if (!env.MODEL_SERVICE_URL) {
    throw new Error("MODEL_SERVICE_URL is not configured.");
  }

  const controller = new AbortController();
  const timeoutMs = Math.max(env.MODEL_SERVICE_TIMEOUT_MS, 10000);
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  try {
    const response = await fetch(
      `${env.MODEL_SERVICE_URL}/v1/forecast/snapshot`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId,
          horizon_hours: horizonHours,
          model_name: modelName || undefined,
          start_timestamp: startTimestamp || undefined,
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      let detail = `Model service responded with ${response.status}`;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload?.detail) {
          detail = payload.detail;
        }
      } catch {
        // Keep default detail when payload is not JSON.
      }
      throw new Error(detail);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const fallback = await getForecastApiPayload();
    const servedFeatureImportance = payload.featureImportance;

    // Ensure shape compatibility with frontend expectations.
    return {
      ...payload,
      featureImportance:
        Array.isArray(servedFeatureImportance) && servedFeatureImportance.length > 0
          ? servedFeatureImportance
          : fallback.featureImportance,
      modelComparison: fallback.modelComparison,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const intersection = url.searchParams.get("intersection");
  const requestedLocationId = url.searchParams.get("locationId");
  const modelName = url.searchParams.get("modelName");
  const startTimestamp = url.searchParams.get("startTimestamp");
  const horizonParam = Number(url.searchParams.get("horizonHours") ?? "24");
  const horizonHours = Number.isFinite(horizonParam)
    ? Math.max(1, Math.min(24, Math.round(horizonParam)))
    : 24;
  const locationId =
    requestedLocationId ||
    (intersection ? intersectionToLocationId[intersection] : undefined) ||
    env.FORECAST_DEFAULT_LOCATION_ID;

  try {
    if (env.MODEL_SERVICE_URL) {
      try {
        const served = await getServedForecast(
          locationId,
          horizonHours,
          modelName,
          startTimestamp,
        );
        return NextResponse.json(served);
      } catch (error) {
        const fallback = await getForecastApiPayload();
        const reason =
          error instanceof Error && error.message
            ? error.message
            : "Unknown model service error";
        return NextResponse.json({
          ...fallback,
          meta: {
            location_id: locationId,
            horizon_hours: horizonHours,
            model_name: modelName ?? fallback.bestModel?.name,
            fallback_reason: reason,
          },
        });
      }
    }

    const payload = await getForecastApiPayload();
    return NextResponse.json(payload);
  } catch (error) {
    const rawMessage =
      error instanceof Error && error.message
        ? error.message
        : "Unable to load forecast data.";
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Forecast request timed out while waiting for model service."
        : rawMessage;
    const status = /(must be greater than current|cannot be more than 1 hour before)/i.test(rawMessage)
      ? 400
      : 500;
    return NextResponse.json(
      {
        message,
      },
      { status },
    );
  }
}
