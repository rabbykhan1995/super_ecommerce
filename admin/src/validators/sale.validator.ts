import { z } from "zod";

export const saleProductSchema = z.object({
  productID: z
    .number()
    .min(1, "Product is required"),

  variantID: z.number(),

  batchID: z.number().nullable().optional(),

  soldQty: z
    .number()
    .min(1, "Quantity must be at least 1"),

  salePrice: z
    .number()
    .min(1, "Sale price must be greater than 0"),

  warranty: z.number().nullable().optional(),
  
});

export const posSaleProductSchema = z.object({
  productID: z
    .number()
    .min(1, "Product is required"),

  variantID: z.number(),

  soldQty: z
    .number()
    .min(1, "Quantity must be at least 1"),

  salePrice: z
    .number()
    .min(1, "Sale price must be greater than 0"),
  
});

export const paymentAccountSchema = z.array(z.object({
  accountID: z.number().min(1, "Account is required"),
  amount: z.number({ message: "Amount must be a number" }).min(0.1, { message: "Amount cannot be 0" }),
}));

export const saleSchema = z.object({
  invoiceNo: z.string().trim().optional(),
  customerID: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  costName: z.string().nullable().optional(),
  exchangeAmount:z.number().min(0).default(0),
  totalProductPrice: z.number().min(0).default(0),
  otherCost: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  paid: z.number().min(0).default(0),
  balanceBefore: z.number().default(0),
  balanceAfter: z.number().default(0),
  saleDate: z.coerce.date(),
});

export const createSaleSchema = z.object({
  products: z
    .array(saleProductSchema)
    .min(1, "At least one product is required"),

  accounts: paymentAccountSchema,
  exchangeAccounts:paymentAccountSchema,
  sale: saleSchema,
});
export const createfifoSaleSchema = z.object({
  products: z
    .array(posSaleProductSchema)
    .min(1, "At least one product is required"),

  accounts: paymentAccountSchema,
  exchangeAccounts:paymentAccountSchema,
  sale: saleSchema,
});