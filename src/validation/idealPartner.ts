import { z } from "zod";

export const idealPartnerZ = z.object({
  title: z
    .string()
    .max(120, "Title must be at most 120 characters")
    .nonempty("Title is required"),

  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),

  options: z
    .array(
      z.object({
        label: z
          .string()
          .max(100, "Option label must be at most 100 characters")
          .optional(),
        description: z
          .string()
          .max(250, "Description must be at most 250 characters")
          .optional(),
      })
    )
    .min(1, "At least one option is required"),
});

// ✅ Inferred Type
export type IdealPartnerInput = z.infer<typeof idealPartnerZ>;
