import z from "zod";
import {
  checkoutOrderSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from "./order.validator";
import { orderStatusEnum } from "./order.table";

export type Order = typeof import("./order.table").orderTable.$inferSelect;

export type OrderPayload = typeof import("./order.table").orderTable.$inferInsert;

export type OrderStatus = typeof orderStatusEnum.enumValues[number];

export type OrderItem = typeof import("./order.table").orderItemTable.$inferSelect;

export type OrderItemPayload = typeof import("./order.table").orderItemTable.$inferInsert;

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
