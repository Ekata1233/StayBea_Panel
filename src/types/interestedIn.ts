import { Types } from "mongoose";

export interface IInterestedIn extends Document {
  title: string;
  description: string;
  options: {
    _id: Types.ObjectId;
    label: string;
    value: string;
  }[];
}