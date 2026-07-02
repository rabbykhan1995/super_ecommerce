import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createPurchaseReturnSchema } from "./purchase_return.validator";
import { purchaseReturnTable } from "./purchase_return.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export type PurchaseReturn = typeof purchaseReturnTable.$inferSelect;
export type OnlyPurchaseReturnPayload = z.infer<typeof createPurchaseReturnSchema>;
export type CreatePurchaseReturnInput = z.infer<typeof createPurchaseReturnSchema>;
// export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export  interface PurchaseReturnDetail {
      _id: Types.ObjectId;
      purchaseID: Types.ObjectId;
      supplierID: Types.ObjectId;
      invoiceNo: string;
      totalAmount: number;
      paid: number;
      balanceBefore: number;
      balanceAfter: number;
      discount: number;
      note?: string;
      date: Date;
      status: string;
      accounts: { accountID: Types.ObjectId; amount: number; name: string }[];
      batches: { batchID: Types.ObjectId; purchaseReturnedQty: number; reason?: string }[];
      supplier: any;
      purchase: any;
    }
