import { z } from "zod";

// ✅ Manage Access Options
export const manageAccessSchema = z.object({
  Add: z.boolean(),
  Update: z.boolean(),
  Delete: z.boolean(),
  View: z.boolean(),
  Export: z.boolean(),
});

// ✅ Full Role Schema
export const employeeRoleSchema = z.object({
  roleName: z
    .string()
    .min(3, "Role name must be at least 3 characters")
    .max(50, "Role name is too long"),

  permissions: z.array(z.string()).default([]),

  manageAccess: manageAccessSchema,
});

export type EmployeeRoleFormData = z.infer<typeof employeeRoleSchema>;
