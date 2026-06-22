import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createProductSchema, updateProductSchema } from "./product.validator";

export interface IProduct extends Document {
  name: string;
  barcode: string;
  brandID: Types.ObjectId | null;
  unitID: Types.ObjectId;
  categoryID: Types.ObjectId | null;
  manageStock: boolean;
  thumbnail: string | null;
  manageWarranty: boolean;
  stock: number;
  decimal: boolean;
  alertQty: number;
  createdAt: Date;
  updatedAt: Date;
  salePrice: number;
  purchasePrice: number;
  fifoBatchID?: Types.ObjectId;
  posEnabled:boolean;
}

export type ProductResponse = HydratedDocument<IProduct>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface IBatch extends Document {
  purchaseID: Types.ObjectId | null;
  productID: Types.ObjectId;
  serial?: string;
  purchasedQty: number;
  soldQty: number;
  remainingQty: number;
  saleReturnedQty: number;
  purchaseReturnedQty: number;
  salePrice: number;
  purchasePrice: number;
  PurchaseDate: Date;
  isActive: boolean;
  damagedQty: number;
  warranty: number;
  expireDate:Date | null;
}


export type BatchResponse = HydratedDocument<IBatch>;