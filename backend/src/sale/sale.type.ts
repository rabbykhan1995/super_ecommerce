import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createSaleSchema, updateSaleSchema,createFifoSaleSchema } from "./sale.validator";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export interface ISale extends Document {
  invoiceNo: string;
  customerID?: Types.ObjectId;
  totalProductPrice: number;
  totalAmount: number;
  deletable: boolean;
  note?: string | null;
  otherCost: number | null;
  exchangeAmount:number;
  discount: number | null;
  paid: number;
  balanceBefore:number;
  balanceAfter:number;
  costName: string | null;
  SaleDate: Date;
  createdAt: Date;
  updatedAt: Date;
  accounts: {accountID:Types.ObjectId, amount:number}[] | [];
  exchangeAccounts: {accountID:Types.ObjectId, amount:number}[] | [];
  products: SaleProduct[];
}

export type SaleResponse = HydratedDocument<ISale>;

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateFifoSaleInput = z.infer<typeof createFifoSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};


 export type SaleProduct = {
  productID:Types.ObjectId;
  batchID?:Types.ObjectId;
  soldQty: number;
  salePrice:number;
  warranty?:number;
}