import { z } from "zod";

export const sendContactEmailSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .max(1000, "Email must be at most 1000 characters")
    .email("Invalid email address"),

  message: z
    .string()
    .min(3, "Message must be at least 3 characters")
    .max(1000, "Message must be at most 1000 characters"),
});