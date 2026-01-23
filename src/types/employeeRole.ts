export interface IEmployeeRole extends Document {
  _id: string;
  roleName: string;
  permissions: string[];
  manageAccess: {
    Add: boolean;
    Update: boolean;
    Delete: boolean;
    View: boolean;
    Export: boolean;
  };
  createdAt: Date;
}

