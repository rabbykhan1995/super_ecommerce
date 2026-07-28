import z from "zod";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "./order.validator";

export type Order = typeof import("./order.table").orderTable.$inferSelect;
export type OrderPayload = typeof import("./order.table").orderTable.$inferInsert;

export type OrderItem = typeof import("./order.table").orderItemTable.$inferSelect;
export type OrderItemPayload = typeof import("./order.table").orderItemTable.$inferInsert;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
