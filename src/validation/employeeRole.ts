import { z } from "zod";

/* ---------------- ACTION PERMISSIONS ---------------- */

export const permissionActionsSchema = z.object({
  All: z.boolean().optional(),
  Add: z.boolean().optional(),
  View: z.boolean().optional(),
  Update: z.boolean().optional(),
  Delete: z.boolean().optional(),
  Export: z.boolean().optional(),
});

/* ---------------- EMPLOYEE ROLE SCHEMA ---------------- */

export const employeeRoleSchema = z.object({
  roleName: z
    .string()
    .min(3, "Role name must be at least 3 characters")
    .max(50, "Role name is too long"),

permissions: z.record(z.string(), permissionActionsSchema).default({})});

export type EmployeeRoleFormData = z.infer<typeof employeeRoleSchema>;