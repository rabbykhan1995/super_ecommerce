import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createSaleSchema, updateSaleSchema,createFifoSaleSchema, saleSchema } from "./sale.validator";
import { saleTable } from "./sale.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export type Sale = typeof saleTable.$inferSelect;

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export type OnlySalePayload = z.infer<typeof saleSchema>;

export type CreateFifoSaleInput = z.infer<typeof createFifoSaleSchema>;

export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

 export type SaleProduct = {
  productID:Types.ObjectId;
  batchID?:Types.ObjectId;
  soldQty: number;
  salePrice:number;
  warranty?:number;
}