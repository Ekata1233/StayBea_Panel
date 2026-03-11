import { IEmployeeRole } from "@/types/employeeRole";
import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema(
  {
    All: { type: Boolean, default: false },
    Add: { type: Boolean, default: false },
    View: { type: Boolean, default: false },
    Update: { type: Boolean, default: false },
    Delete: { type: Boolean, default: false },
    Export: { type: Boolean, default: false },
  },
  { _id: false }
);

const employeeRoleSchema = new Schema<IEmployeeRole>(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    permissions: {
      type: Map,
      of: permissionSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeRole ||
  mongoose.model<IEmployeeRole>("EmployeeRole", employeeRoleSchema);