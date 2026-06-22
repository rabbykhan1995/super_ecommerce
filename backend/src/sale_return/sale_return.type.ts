import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createSaleReturnSchema } from "./sale_return.validator";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export interface ISaleReturn extends Document {
    saleID: Types.ObjectId;
    customerID?: Types.ObjectId;
    invoiceNo: string;
    note?: string;
    totalAmount: number;  // return করা products এর total value
    paid: number;         // কত টাকা দেওয়া হলো
    balanceBefore: number;
    balanceAfter: number;
    discount: number;
    accounts: { accountID: Types.ObjectId; amount: number }[];
    batches: { 
        batchID: Types.ObjectId; 
        productID: Types.ObjectId;
        saleReturnedQty: number; 
        salePrice: number;
        reason?: string;
    }[];
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}


export type SaleReturnResponse = HydratedDocument<ISaleReturn>;

export type CreateSaleReturnInput = z.infer<typeof createSaleReturnSchema>;
// export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export  interface SaleReturnDetail {
      _id: Types.ObjectId;
      saleID: Types.ObjectId;
      customerID: Types.ObjectId;
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
      batches: { batchID: Types.ObjectId; saleReturnedQty: number; reason?: string }[];
      customer: any;
      sale: any;
    }
