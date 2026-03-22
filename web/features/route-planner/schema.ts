import { z } from "zod";

import { cityFocusAreas } from "@/lib/site-config";

export const routePlanSchema = z
  .object({
    origin: z.enum(cityFocusAreas),
    destination: z.enum(cityFocusAreas),
    departureDate: z.string().date(),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((value) => value.origin !== value.destination, {
    message: "Origin and destination must be different.",
    path: ["destination"],
  });

export type RoutePlanInput = z.infer<typeof routePlanSchema>;
