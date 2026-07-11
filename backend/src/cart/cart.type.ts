import z from "zod";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "./cart.validator";
import { cartTable } from "./cart.table";

export type CartItem = typeof cartTable.$inferSelect;

export type CartItemPayload = typeof cartTable.$inferInsert;

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
