import { z } from "zod";
import { paymentAccountSchema } from "../account/account.validator";

export const purchaseReturnItemSchema = z.object({
        productID: z.number(),
        batchID: z.number(),
        variantID: z.number(),
        purchaseReturnQty: z.number().positive(),
        reason: z.string().optional(),
    })

export const purchaseReturnSchema = z.object({
    purchaseID: z.number(),
    supplierID:z.number(),
    note: z.string().optional(),
    discount: z.number().default(0),
    paid: z.number().min(0),
    exchagneAmount: z.number().min(0),
    date: z
        .coerce
        .date({ message: "Purchase Return date must be a valid date" })
})


export const createPurchaseReturnSchema = z.object({
    purchaseReturn:purchaseReturnSchema,
    products: z.array(purchaseReturnItemSchema).min(1),
    accounts: paymentAccountSchema,
    exchangeAccounts: paymentAccountSchema,
});
