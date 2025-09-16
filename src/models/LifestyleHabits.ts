// models/LifestyleHabits.ts
import { ILifestyleHabits } from "@/types/lifeStyleHabits";
import { Schema, model, models } from "mongoose";

const LifestyleHabitsSchema = new Schema<ILifestyleHabits>({
  title: { type: String, required: true }, // e.g. "Lifestyle Habits"
  description: { type: String, required: true }, // general description for the group

  habits: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      label: { type: String, required: true }, // e.g. "How often do you drink?"
      options: [
        {
          _id: { type: Schema.Types.ObjectId, auto: true },
          label: { type: String, required: true }, // e.g. "Not for me"
          description: { type: String }, // optional, in case you want more detail
        },
      ],
    },
  ],
});

// Note: no timestamps, consistent with your style
export const LifestyleHabits =
  (models.LifestyleHabits as any) ||
  model<ILifestyleHabits>("LifestyleHabits", LifestyleHabitsSchema);
