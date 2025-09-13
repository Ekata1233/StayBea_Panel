import { IEmployeeRole } from "@/types/employeeRole";
import mongoose, { Schema, Document } from "mongoose";


const employeeRoleSchema = new Schema<IEmployeeRole>(
  {
    roleName: { type: String, required: true, unique: true, trim: true },

    permissions: [{ type: String }],

    manageAccess: {
      Add: { type: Boolean, default: true },
      Update: { type: Boolean, default: true },
      Delete: { type: Boolean, default: true },
      View: { type: Boolean, default: true },
      Export: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeRole ||
  mongoose.model<IEmployeeRole>("EmployeeRole", employeeRoleSchema);
