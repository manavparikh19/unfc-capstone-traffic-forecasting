import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ENABLE_ANALYTICS: booleanString.default(false),
  NEXT_PUBLIC_USE_MOCK_DATA: booleanString.default(false),
  NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR: booleanString.default(false),
  CONTACT_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  SENTRY_DSN: z.string().optional().or(z.literal("")),
  ROUTE_PROVIDER: z.enum(["demo", "mapbox"]).default("demo"),
  ROUTE_PROVIDER_TOKEN: z.string().optional().or(z.literal("")),
  MODEL_SERVICE_URL: z.string().url().optional().or(z.literal("")),
  MODEL_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  FORECAST_DEFAULT_LOCATION_ID: z.string().default("10133019_NB"),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(6),
  ROUTE_PLAN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
});

const parsedEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR:
    process.env.NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR,
  CONTACT_WEBHOOK_URL: process.env.CONTACT_WEBHOOK_URL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  ROUTE_PROVIDER: process.env.ROUTE_PROVIDER,
  ROUTE_PROVIDER_TOKEN: process.env.ROUTE_PROVIDER_TOKEN,
  MODEL_SERVICE_URL: process.env.MODEL_SERVICE_URL,
  MODEL_SERVICE_TIMEOUT_MS: process.env.MODEL_SERVICE_TIMEOUT_MS,
  FORECAST_DEFAULT_LOCATION_ID: process.env.FORECAST_DEFAULT_LOCATION_ID,
  CONTACT_RATE_LIMIT_MAX: process.env.CONTACT_RATE_LIMIT_MAX,
  ROUTE_PLAN_RATE_LIMIT_MAX: process.env.ROUTE_PLAN_RATE_LIMIT_MAX,
});

export const env = parsedEnv;

export const publicEnv = {
  NEXT_PUBLIC_SITE_URL: parsedEnv.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ENABLE_ANALYTICS: parsedEnv.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_USE_MOCK_DATA: parsedEnv.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR:
    parsedEnv.NEXT_PUBLIC_ALLOW_FALLBACK_ON_ERROR,
};
