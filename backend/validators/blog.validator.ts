import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required") // এটাই required_error এর কাজ করবে
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),

  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),

  shortDescription: z
    .string()
    .max(250, "Short description is too long")
    .optional(),

  thumbnail: z.string().nullable().optional(),

  tags: z.array(z.string()).default([]),

  images: z.array(z.string()).optional(),
});

export const updateBlogSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});
