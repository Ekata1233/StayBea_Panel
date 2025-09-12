import { Document, Types } from "mongoose";

export interface ISexualOrientation extends Document {
  title: string; // main title (20–25 chars limit)
  description: string; // main description (50–60 chars limit)
  options: {
    _id: Types.ObjectId; // auto-generated unique ID for each option
    label: string; // option title (20–25 chars limit)
    description: string; // option description (50–60 chars limit)
  }[];
}
