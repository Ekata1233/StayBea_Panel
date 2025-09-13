import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  address: z.string().max(200, "Address is too long").optional(),
  image: z.string().url("Invalid image URL").optional(),

  role: z.string().optional(),

  identityType: z.enum(["aadhar", "pan", "passport"]).optional(),
  identityNumber: z
    .string()
    .min(6, "Identity number must be at least 6 characters")
    .optional(),
  identityImage: z.string().url("Invalid identity image URL").optional(),

  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters"),

  isActive: z.boolean().default(true),
});

// ✅ Ensure password === confirmPassword
export const employeeSchemaWithConfirm = employeeSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error will show on confirmPassword
  }
);

export type EmployeeFormData = z.infer<typeof employeeSchemaWithConfirm>;
