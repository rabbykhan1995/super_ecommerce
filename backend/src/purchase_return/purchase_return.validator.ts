import { z } from "zod";
import { Types } from "mongoose";


export const createPurchaseReturnSchema = z.object({
    purchaseID: z.string().refine(val => Types.ObjectId.isValid(val)),
    note: z.string().optional(),
    discount: z.number().default(0),
    paid: z.number().min(0),
    batches: z.array(z.object({
        batchID: z.string().refine(val => Types.ObjectId.isValid(val)),
        purchaseReturnQty: z.number().positive(),
        reason: z.string().optional(),
    })).min(1),
    accounts: z.array(z.object({
        accountID: z.string().refine(val => Types.ObjectId.isValid(val)),
        amount: z.number().positive(),
    })).optional().default([]),
    date: z
        .coerce
        .date({ message: "Purchase date must be a valid date" })
});
