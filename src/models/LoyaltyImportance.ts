// models/LoyaltyImportance.ts
import { ILoyaltyImportance } from "@/types/loyaltyImportance";
import { Schema, model, models } from "mongoose";

const LoyaltyImportanceSchema = new Schema<ILoyaltyImportance>({
  title: { type: String, required: true }, // main question
  description: { type: String }, // optional now
  options: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      label: { type: String }, // optional now
      description: { type: String }, // optional
    },
  ],
});

// no timestamps
export const LoyaltyImportance =
  (models.LoyaltyImportance as any) ||
  model<ILoyaltyImportance>("LoyaltyImportance", LoyaltyImportanceSchema);
