import { Document, Types } from "mongoose";

export interface PermissionActions {
  All?: boolean;
  Add?: boolean;
  View?: boolean;
  Update?: boolean;
  Delete?: boolean;
  Export?: boolean;
}

export interface IEmployeeRole extends Document {
  _id: Types.ObjectId;

  roleName: string;

  permissions: {
    [module: string]: PermissionActions;
  };

  createdAt: Date;
  updatedAt: Date;
}