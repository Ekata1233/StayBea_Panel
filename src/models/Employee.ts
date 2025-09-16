import { IEmployee } from "@/types/employee";
import mongoose, { Schema, Document } from "mongoose";

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    image: { type: String }, // store uploaded image URL or path
     role: { 
      type: Schema.Types.ObjectId, 
      ref: "EmployeeRole", 
      required: true 
    },
    identityType: { 
      type: String, 
      enum: ["aadhar", "pan", "passport"], 
    },
    identityNumber: { type: String, trim: true },
    identityImage: { type: String }, // store uploaded file URL

    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hash before save

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", employeeSchema);
