import { optional, z } from "zod";

const variantSchema = z.object({
  name: z.string().default("none"),
  value: z.string().nullable().default(null),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "is required"),

  barcode: z.string().optional(),

  description: z.string().nullable().optional(),

  shortDescription: z.string().nullable().optional(),

  metaTitle: z.string().nullable().optional(),

  metaDescription: z.string().nullable().optional(),

  keywords: z.array(z.string()).default([]).optional(),

  brandID: z.number().nullable().optional(),

  unitID: z.number("is required"),
  
  categoryID: z.number().nullable().optional(),

  manageStock: z.boolean().default(true),

  manageWarranty: z.boolean().default(false),

  thumbnail: z.string().nullable().optional(),

  video: z.string().nullable().optional(),

  stock: z.coerce.number().default(0),

  alertQty: z.coerce.number().default(0),

  decimal: z.boolean().default(false),

  purchasePrice: z.coerce.number().default(0),

  salePrice: z.coerce.number().default(0),

  isPublished: z.boolean().default(false),

  inPosList: z.boolean().default(false),

  sku: z.string().nullable().optional(),

  status: z
    .enum(["active", "inactive", "draft", "archived"])
    .default("active"),

  featured: z.boolean().default(false),

  showStock: z.boolean().default(true),

  weight: z.coerce.number().nullable().optional(),

  sortOrder: z.coerce.number().default(0),

  variants: z.array(variantSchema).default([
    {
      name: "none",
      value: null,
    },
  ]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),

  barcode: z.string().optional(),

  description: z.string().nullable().optional(),

  shortDescription: z.string().nullable().optional(),

  metaTitle: z.string().nullable().optional(),

  metaDescription: z.string().nullable().optional(),

  keywords: z.array(z.string()).optional(),

  brandID: z.number().nullable().optional(),

  unitID: z.number().optional(),

  categoryID: z.number().nullable().optional(),

  manageStock: z.boolean().optional(),

  manageWarranty: z.boolean().optional(),

  thumbnail: z.string().nullable().optional(),

  video: z.string().nullable().optional(),

  stock: z.coerce.number().optional(),

  alertQty: z.coerce.number().optional(),

  decimal: z.boolean().optional(),

  purchasePrice: z.coerce.number().optional(),

  salePrice: z.coerce.number().optional(),

  isPublished: z.boolean().optional(),

  inPosList: z.boolean().optional(),

  sku: z.string().nullable().optional(),

  status: z
    .enum(["active", "inactive", "draft", "archived"])
    .optional(),

  featured: z.boolean().optional(),

  showStock: z.boolean().optional(),

  weight: z.coerce.number().nullable().optional(),

  sortOrder: z.coerce.number().optional(),

  variants: z.array(variantSchema).optional(),
});