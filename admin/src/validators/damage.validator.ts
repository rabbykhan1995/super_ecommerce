import { z } from "zod";

const damageItemSchema = z.object({
    batchID: z.number().optional().nullable(),
    productID: z.number().optional().nullable(),
    variantID: z.number().optional().nullable(),
    damagedQty: z
        .number({ message: "Damage qty must be a number" })
        .min(1, "Damage qty must be at least 1"),
    purchasePrice: z
        .number({ message: "Purchase price must be a number" })
        .min(0)
        .optional(),
    reason: z.enum(["expired", "manual"]).default("manual"),
});

export const createDamageSchema = z.object({
    note: z.string().optional().nullable(),



    damageDate: z.coerce.date(),

    items: z
        .array(damageItemSchema)
        .min(1, "At least one damaged item is required"),
});