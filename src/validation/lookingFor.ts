import { z } from "zod";

export const lookingForZ = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(35, "Title must be at most 35 characters"),
  description: z
    .string()
    .min(35, "Description must be at least 35 characters")
    .max(200, "Description must be at most 200 characters"),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Label is required"),
        description: z
          .string()
          .min(20, "Description must be at least 20 characters")
          .max(150, "Description must be at most 150 characters"),
      })
    )
    .min(1, "At least one option is required"),
});

// Type inferred from schema
export type LookingForInput = z.infer<typeof lookingForZ>;
