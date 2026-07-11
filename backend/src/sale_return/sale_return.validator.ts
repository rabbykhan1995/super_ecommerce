import { z } from "zod";
import { paymentAccountSchema } from "../account/account.validator";

export const saleReturnItemSchema = z.object({
  productID: z.number(),
  batchID: z.number(),
  variantID: z.number(),
  saleReturnQty: z.number().positive(),
  salePrice: z.number().positive(),
  reason: z.string().optional(),
});

export const saleReturnSchema = z.object({
  saleID: z.number(),
  customerID: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
  discount: z.number().min(0).default(0),
  paid: z.number().min(0),
  exchangeAmount: z.number().min(0),
  date: z.coerce.date({ message: "Sale Return date must be a valid date" }),
  balanceBefore: z
    .number({ message: "Balance before must be a number" })
    .default(0),
  balanceAfter: z
    .number({ message: "Balance after must be a number" })
    .default(0),
});

export const createSaleReturnSchema = z.object({
  saleReturn: saleReturnSchema,
  products: z.array(saleReturnItemSchema).min(1),
  accounts: paymentAccountSchema,
  exchangeAccounts: paymentAccountSchema,
});
