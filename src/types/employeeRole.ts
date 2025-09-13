export interface IEmployeeRole extends Document {
  roleName: string;
  permissions: string[];
  manageAccess: {
    Add: boolean;
    Update: boolean;
    Delete: boolean;
    View: boolean;
    Export: boolean;
  };
}