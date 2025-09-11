// validations/sexualOrientation.ts
import { z } from "zod";

/**
 * According to your earlier requirement:
 * - main description: 20-25 chars
 * - option description: 50-60 chars
 */
export const optionSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1, "Label required"),
  description: z
    .string()
    .min(30, "Option description must be at least 30 characters")
    .max(60, "Option description must be at most 60 characters"),
  value: z.string().min(1, "Value required"),
});

export const sexualOrientationSchema = z.object({
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(25, "Description must be at most 25 characters"),
  options: z.array(optionSchema).nonempty("At least one option is required"),
});

// For partial updates (PATCH)
export const sexualOrientationPatchSchema = sexualOrientationSchema.partial();

// Types
export type SexualOrientationInput = z.infer<typeof sexualOrientationSchema>;
export type SexualOrientationPatch = z.infer<typeof sexualOrientationPatchSchema>;
