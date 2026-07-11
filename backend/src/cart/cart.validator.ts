import { z } from "zod";

export const addToCartSchema = z.object({
  productID: z.number(),
  variantID: z.number(),
  quantity: z.number().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().positive(),
});

export const removeFromCartSchema = z.object({
  cartItemID: z.number(),
});

export const clearCartSchema = z.object({
  userID: z.string().uuid(),
});
