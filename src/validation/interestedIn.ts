import { z } from "zod";

export const interestedInZ = z.object({
  title: z
    .string()
    .max(35, "Title must be at most 35 characters")
    .nonempty("Title is required"),
  description: z
    .string()
    .max(100, "Description must be at most 100 characters")
    .nonempty("Description is required"),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Label is required")
      })
    )
    .min(1, "At least one option is required"),
});

// Type inferred from schema
export type InterestedInInput = z.infer<typeof interestedInZ>;