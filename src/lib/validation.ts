import { z } from "zod";

export const orderSchema = z.object({
  clientName: z.string().trim().min(3).max(60),
  clientWhatsapp: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/),
  category: z.enum([
    "web_development",
    "game_development",
    "system_custom",
    "qa_tester_bugfix",
    "other",
  ]),
  tier: z.enum(["student", "business"]).default("student"),
  features: z.array(z.string()).min(1),
  databaseRequired: z.boolean(),
  urgency: z.enum(["standard", "rush", "urgent"]),
  estimatedPriceMin: z.number().nonnegative(),
  estimatedPriceMax: z.number().positive(),
  estimatedDays: z.number().int().positive(),
  notes: z.string().max(1000).optional(),
  website_url_hp: z.string().max(0).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
