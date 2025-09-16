// models/LifestyleInterests.ts
import { ILifestyleInterests } from "@/types/lifestyleInterests";
import { Schema, model, models } from "mongoose";

const LifestyleInterestsSchema = new Schema<ILifestyleInterests>({
  title: { type: String, required: true }, // e.g. "Lifestyle Interests"
  description: { type: String }, // optional overview
  categories: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      label: { type: String, required: true }, // e.g. "Self-Care", "Sports"
      description: { type: String }, // optional extra info
      options: [
        {
          _id: { type: Schema.Types.ObjectId, auto: true },
          label: { type: String, required: true }, // e.g. "Cold Plunging"
          description: { type: String }, // optional
          icon: { type: String }, // optional (for emoji like ☕, 🍕, etc.)
        },
      ],
    },
  ],
});

// no timestamps, consistent with your other models
export const LifestyleInterests =
  (models.LifestyleInterests as any) ||
  model<ILifestyleInterests>("LifestyleInterests", LifestyleInterestsSchema);
