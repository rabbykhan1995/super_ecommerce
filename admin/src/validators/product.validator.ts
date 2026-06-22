import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "name is required"),
  barcode: z.string(" barcode must be string").optional(),
  brandID: z.string().nullable().optional(),
  unitID: z.string().min(1, "is required"),
  categoryID: z.string().nullable().optional(),
  manageStock: z.boolean().default(true),
  thumbnail: z.string().nullable().optional(),
  stock: z.number("must be number").default(0),
  alertQty: z.number("must be number").default(0).optional(),
  decimal: z.boolean("must be number").default(false).optional(),
  salePrice:z.number("must be number").default(0).optional(),
  purchasePrice:z.number("must be number").default(0).optional(),
  manageWarranty: z.boolean().default(false),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  barcode: z.string().min(1).optional(),
  brandID: z.string().nullable().optional(),
  unitID: z.string().optional(),
  categoryID: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  alertQty: z.number("must be number").default(0).optional(),
  salePrice:z.number("must be number").default(0).optional(),
  purchasePrice:z.number("must be number").default(0).optional(),
});