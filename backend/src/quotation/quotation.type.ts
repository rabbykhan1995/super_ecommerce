import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { SaleProduct } from "../sale/sale.type";
import { createSaleQuotationSchema } from "./quotation.validator";

export type QuotationStatus = "pending" | "approved" | "cancelled"

export interface ISaleQuotation extends Document {
  status:QuotationStatus;
  customerID?: Types.ObjectId;
  totalProductPrice: number;
  totalAmount: number;
  note?: string | null;
  otherCost: number | null;
  discount: number | null;
  costName: string | null;
  SaleDate: Date;
  createdAt: Date;
  updatedAt: Date;
  products: SaleProduct[];
  deletable:boolean;
  balanceBefore:number;
  balanceAfter:number;
}

export type SaleQuotationResponse = HydratedDocument<ISaleQuotation>;

export type CreateSaleQuotationInput = z.infer<typeof createSaleQuotationSchema>;




