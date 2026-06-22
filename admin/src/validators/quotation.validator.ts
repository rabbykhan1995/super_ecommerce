import { z } from "zod";
import { paymentAccountSchema, saleProductSchema } from "./sale.validator";

export const createSaleQuotationSchema = z.object({
    contactID: z
        .string()
        .optional().nullable(),
    note: z.string().optional().nullable(),
    costName: z.string().optional().nullable(),
    totalProductPrice: z
        .number({ message: "Total product price must be a number" })
        .min(0, { message: "Total product price cannot be negative" })
        .default(0),
    exchangeAmount: z.number().min(0).default(0),
    otherCost: z
        .number({ message: "Other cost must be a number" })
        .min(0, { message: "Other cost cannot be negative" })
        .default(0),
    discount: z
        .number({ message: "Discount must be a number" })
        .min(0, { message: "Discount cannot be negative" })
        .default(0),
    totalAmount: z
        .number({ message: "Total amount must be a number" })
        .min(0, { message: "Total amount cannot be negative" })
        .default(0),
    saleDate: z
        .coerce
        .date({ message: "Sale date must be a valid date" }),
    balanceBefore: z
        .number({ message: "Balance before must be a number" })
        .default(0),

    balanceAfter: z
        .number({ message: "Balance after must be a number" })
        .default(0),
    products: z
        .array(saleProductSchema)
        .min(1, { message: "At least one product is required" }),
})


export const approveSaleQuotationSchema = z.object({
    exchangeAmount: z.number().min(0).default(0),
    balanceBefore: z
        .number({ message: "Balance before must be a number" })
        .default(0),
    balanceAfter: z
        .number({ message: "Balance after must be a number" })
        .default(0),
    saleDate: z
        .coerce
        .date({ message: "Sale date must be a valid date" }),
    paid: z
        .number({ message: "Paid amount must be a number" })
        .min(0, { message: "Paid amount cannot be negative" })
        .default(0),
    accounts: paymentAccountSchema,
    exchangeAccounts: paymentAccountSchema,
})

