import { IInterestedIn } from "@/types/interestedIn";
import { Schema, model } from "mongoose";

// Mongoose schema
const InterestedInSchema = new Schema<IInterestedIn>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true }, // auto-generate ObjectId
      label: { type: String, required: true }         // e.g. "men"
    },
  ],
});

// Example model
export const InterestedIn = model<IInterestedIn>(
  "InterestedIn",
  InterestedInSchema
);
