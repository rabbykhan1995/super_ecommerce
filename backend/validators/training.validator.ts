import { z } from "zod";

export const createTrainingSchema = z.object({
  title: z
    .string()
    .min(1, "is required")
    .min(3, "must be at least 3 characters")
    .max(100, "is too long"),

  price: z.number("is required").min(0, "cannot be negative"),

  levelID: z.string("Level (Experience) is required").min(1, "is required"), // mongoose ObjectId as a string

  duration: z.number().min(0, "cannot be negative").default(0).optional(),

  description: z
    .string()
    .min(1, "is required")
    .min(10, "must be at least 10 characters"),

  shortDescription: z.string().max(250, " is too long").optional(),

  thumbnail: z.string().nullable().optional(),

  tags: z.array(z.string()).default([]),

  images: z.array(z.string()).default([]),

  active: z.boolean().default(true).optional(),
});

// Update schema-te shob kichu optional thake (partial update er jonno)
export const updateTrainingSchema = createTrainingSchema.partial().extend({
  // Jodi update korar somoy tags ba images pura empty list pathate chao
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export const createLevelSchema = z.object({
  name: z.string().min(1, "is required"),
});
