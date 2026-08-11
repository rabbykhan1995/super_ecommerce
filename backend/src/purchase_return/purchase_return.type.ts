import z from "zod";
import {
  purchaseReturnSchema,
  createPurchaseReturnSchema,
} from "./purchase_return.validator";
import {
  purchaseReturnItemsTable,
  purchaseReturnTable,
} from "./purchase_return.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier,
export type PurchaseReturn = typeof purchaseReturnTable.$inferSelect;
export type OnlyPurchaseReturnPayload = z.infer<typeof purchaseReturnSchema>;
export type CreatePurchaseReturnInput = z.infer<
  typeof createPurchaseReturnSchema
>;
// export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseReturnItemPayload =
  typeof purchaseReturnItemsTable.$inferInsert;
export type PurchaseReturnItem = typeof purchaseReturnItemsTable.$inferSelect;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

