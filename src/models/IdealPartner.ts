// models/IdealPartner.ts
import { IIdealPartner } from "@/types/idealPartner";
import { Schema, model, models } from "mongoose";

const IdealPartnerSchema = new Schema<IIdealPartner>({
  title: { type: String, required: true }, // main question
  description: { type: String }, // optional
  options: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      label: { type: String }, // optional
      description: { type: String }, // optional
    },
  ],
});

// no timestamps
export const IdealPartner =
  (models.IdealPartner as any) ||
  model<IIdealPartner>("IdealPartner", IdealPartnerSchema);
