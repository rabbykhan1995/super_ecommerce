import { z } from "zod";

const damageItemSchema = z.object({
    batchID: z.string().optional().nullable(),
    productID: z.string().optional().nullable(),
    damageQty: z
        .number({ message: "Damage qty must be a number" })
        .min(1, "Damage qty must be at least 1"),
    reason: z.enum(["expired", "manual"]).default("manual"),
});

export const createDamageSchema = z.object({
    note: z.string().optional().nullable(),



    DamageDate: z.coerce.date(),

    items: z
        .array(damageItemSchema)
        .min(1, "At least one damaged item is required"),
});