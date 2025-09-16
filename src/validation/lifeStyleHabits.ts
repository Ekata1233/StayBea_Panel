import { z } from "zod";

export const lifestyleHabitsZ = z.object({
  title: z
    .string()
    .max(35, "Title must be at most 35 characters")
    .nonempty("Title is required"),

  description: z
    .string()
    .max(150, "Description must be at most 150 characters")
    .nonempty("Description is required"),

  habits: z
    .array(
      z.object({
        label: z
          .string()
          .max(100, "Question must be at most 100 characters")
          .nonempty("Habit question is required"),

        options: z
          .array(
            z.object({
              label: z
                .string()
                .max(50, "Option must be at most 50 characters")
                .nonempty("Option label is required"),
              description: z.string().max(100).optional(),
            })
          )
          .min(1, "At least one option is required"),
      })
    )
    .min(1, "At least one habit is required"),
});

// ✅ Inferred Type
export type LifestyleHabitsInput = z.infer<typeof lifestyleHabitsZ>;
