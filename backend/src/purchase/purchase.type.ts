import z from "zod";
import { createPurchaseSchema, purchaseSchema, updatePurchaseSchema } from "./purchase.validator";
import { purchaseTable } from "./purchase.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export type Purchase = typeof purchaseTable.$inferSelect;

export type OnlyPurchasePayload = z.infer<typeof purchaseSchema>;;

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
