import { Types } from "mongoose";

export interface ILookingFor extends Document {
  title: string;
  description: string;
  options: {
    _id: Types.ObjectId;
    label: string;
    description: string;
  }[];
}