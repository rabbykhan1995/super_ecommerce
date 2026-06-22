import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createPurchaseSchema, updatePurchaseSchema } from "./purchase.validator";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export interface IPurchase extends Document {
  invoiceNo: string;
  supplierID: Types.ObjectId;
  totalProductPrice: number;
  totalAmount: number;
  deletable: boolean;
  note?: string | null;
  otherCost: number | null;
  discount: number | null;
  paid: number;
  exchangeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  costName: string | null;
  PurchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
  accounts: { accountID: Types.ObjectId, amount: number }[] | []
}

export type PurchaseResponse = HydratedDocument<IPurchase>;

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
