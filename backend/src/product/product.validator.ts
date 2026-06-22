import { optional, z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "is required"),
  barcode: z.string().optional(),
  brandID: z.string().nullable().optional(),
  unitID: z.string().min(1, "is required"),
  categoryID: z.string().nullable().optional(),
  manageStock: z.boolean().default(true),
  manageWarranty: z.boolean().default(false),
  thumbnail: z.string().nullable().optional(),
  stock: z.number("must be number").default(0),
  alertQty: z.number("must be number").default(0).optional(),
  decimal: z.boolean().default(false).optional(),
  purchasePrice: z.number("must be number").default(0).optional(),
  salePrice: z.number("must be number").default(0).optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  barcode: z.string().min(1).optional(),
  brandID: z.string().nullable().optional(),
  unitID: z.string().optional(),
  categoryID: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  alertQty: z.number("must be number").default(0).optional(),
  purchasePrice: z.number("must be number").default(0).optional(),
  salePrice: z.number("must be number").default(0).optional(),
  posEnabled:z.boolean().optional().default(false),
});