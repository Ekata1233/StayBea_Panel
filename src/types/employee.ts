import { Types } from "mongoose";

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  image?: string; // profile image URL
  role: Types.ObjectId; // e.g. admin, manager, staff
  identityType?: "aadhar" | "pan" | "passport";
  identityNumber?: string;
  identityImage?: string; // file URL
  email: string;
  password: string;
  isActive: boolean;
}