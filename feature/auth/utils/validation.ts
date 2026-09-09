import { z } from "zod";

const emailSchema = z.email("Enter a valid email address.").trim().toLowerCase();
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .refine((value) => value.trim().length > 0, "Enter a non-blank password.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be 72 bytes or fewer.");

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function readFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export const changePasswordSchema = updatePasswordSchema.safeExtend({
  currentPassword: z.string().min(1, "Enter your current password."),
}).refine((value) => value.password !== value.currentPassword, {
  message: "Choose a different new password.",
  path: ["password"],
});
