import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  company: z.string().min(2).max(80),
  role: z.string().min(2).max(80),
  message: z.string().min(20).max(1000),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
