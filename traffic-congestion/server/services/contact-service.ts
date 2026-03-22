import {
  contactRequestSchema,
  type ContactRequest,
} from "@/features/contact/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { trackEvent } from "@/lib/observability";

export async function submitContactRequest(input: ContactRequest) {
  const payload = contactRequestSchema.parse(input);

  trackEvent(
    "contact.request_submitted",
    {
      company: payload.company,
      role: payload.role,
    },
    { onServer: true },
  );

  logger.info("contact.request.accepted", {
    email: payload.email,
    company: payload.company,
    webhookConfigured: Boolean(env.CONTACT_WEBHOOK_URL),
  });

  if (env.CONTACT_WEBHOOK_URL) {
    await fetch(env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  }

  return {
    ok: true,
    message: "Request received. Our team will reach out with a demo agenda.",
  };
}
