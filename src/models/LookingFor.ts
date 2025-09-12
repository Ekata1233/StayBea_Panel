import { ILookingFor } from "@/types/lookingFor";
import { Schema, model, models } from "mongoose";

// Mongoose schema
const LookingForSchema = new Schema<ILookingFor>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true }, // auto-generate ObjectId
      label: { type: String, required: true },         // e.g. "men"
      description: { type: String, required: true }  
    },
  ],
});

// Example model
export const LookingFor =   models.LookingFor || model<ILookingFor>("LookingFor", LookingForSchema);
