import { z } from "zod";

export const updateCartSchema = z
  .object({
    itemID: z.string(),
    itemSlug: z.string(),
    itemTitle: z.string(),
    thumbnail: z.string().optional(),
    price: z.number(),
    stock: z.number().optional(),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  })
  .superRefine((data, ctx) => {
    if (data.stock !== undefined && data.quantity > data.stock) {
      ctx.addIssue({
        code: "custom",
        message: "Quantity cannot exceed stock",
        path: ["quantity"],
      });
    }
  });
