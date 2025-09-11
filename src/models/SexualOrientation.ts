// models/SexualOrientation.ts
import { Schema, model, models } from "mongoose";
import type { ISexualOrientation } from "@/types/sexualOrientation";

const SexualOrientationSchema = new Schema<ISexualOrientation>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      label: { type: String, required: true },
      description: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
});

// Note: intentionally not adding timestamps — schema fields kept as original
export const SexualOrientation = (models.SexualOrientation as any) || model<ISexualOrientation>("SexualOrientation", SexualOrientationSchema);
