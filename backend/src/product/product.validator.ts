import { optional, z } from "zod";


const variantAttributeSchema = z.object({
  name: z.string().trim().min(1).default("base"),
  value: z.string().trim().min(1).default("none"),
});

export const variantItemSchema = z.object({
  salePrice: z.coerce
    .number()
    .min(0, "Sale price cannot be negative")
    .default(0),

  // Weight in KG
  weight: z.coerce
    .number()
    .min(0, "Weight cannot be negative")
    .default(0),

  barcode: z.string().trim().optional(),

  attributes: z
    .array(variantAttributeSchema)
    .default([{ name: "base", value: "none" }]),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "is required"),

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

  sortOrder: z.coerce.number().default(0),

  variants: z.array(variantItemSchema, "must requird 1 variant"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),

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


  sortOrder: z.coerce.number().optional(),

  variants: z.array(variantItemSchema, "must requird 1 variant").optional(),
});