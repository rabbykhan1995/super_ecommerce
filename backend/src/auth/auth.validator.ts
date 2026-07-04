import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().nonempty("Name is required"),
  openID: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
    .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
    .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
    .refine(
      (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
      "Password must contain at least one special character"
    )
    .optional(),
  email: z.string().email("Invalid email address"),
  addresss: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
    otp: z
    .string()
    .length(6, "OTP must be 6 digits")       // exactly 6 characters
    .regex(/^\d{6}$/, "OTP must be numeric") 
});

export const updateUserSchema = z.object({
  name: z.string().nonempty("Name cannot be empty").optional(),
    openID: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  email: z.string().email("Invalid email address").nullable().optional(),
  addresss: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
});


export const userLoginSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  identifier: z
    .string()
    .min(1, "Identifier is required")
    .refine((val) => {
      // email regex
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // mobile regex (Bangladesh 01XXXXXXXXX)
      const mobileRegex =
        /^(?:\+88)?01[3-9]\d{8}$/;

      return emailRegex.test(val) || mobileRegex.test(val);
    }, "Identifier must be a valid email or mobile number"),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
    .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
    .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
    .refine(
      (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
      "Password must contain at least one special character"
    ),

  email: z.string().email("Invalid email address"),

  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});
