import { z } from "zod";

export const lifestyleInterestsZ = z.object({
  title: z
    .string()
    .max(100, "Title must be at most 100 characters")
    .nonempty("Title is required"),

  description: z
    .string()
    .max(250, "Description must be at most 250 characters")
    .optional(),

  categories: z
    .array(
      z.object({
        label: z
          .string()
          .max(80, "Category label must be at most 80 characters")
          .nonempty("Category label is required"),
        description: z.string().max(200).optional(),
        options: z
          .array(
            z.object({
              label: z
                .string()
                .max(80, "Option label must be at most 80 characters")
                .nonempty("Option label is required"),
              description: z.string().max(200).optional(),
              icon: z.string().max(5).optional(), // emoji or short text
            })
          )
          .min(1, "At least one option is required"),
      })
    )
    .min(1, "At least one category is required"),
});

// ✅ Inferred Type
export type LifestyleInterestsInput = z.infer<typeof lifestyleInterestsZ>;
