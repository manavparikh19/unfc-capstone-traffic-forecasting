import { env, publicEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

export function trackEvent(
  name: string,
  payload?: Record<string, unknown>,
  options?: { onServer?: boolean },
) {
  if (!publicEnv.NEXT_PUBLIC_ENABLE_ANALYTICS && !options?.onServer) {
    return;
  }

  logger.info("analytics.event", {
    event: name,
    payload,
    source: options?.onServer ? "server" : "client",
  });
}

export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  logger.error("application.error", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    sentryConfigured: Boolean(env.SENTRY_DSN),
    ...context,
  });
}
