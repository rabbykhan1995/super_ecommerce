import { z } from "zod";

const damageItemSchema = z.object({
    batchID: z.string().optional().nullable(),
    productID: z.string(),
    damageQty: z
        .number({ message: "Damage qty must be a number" })
        .min(1, "Damage qty must be at least 1"),
});

export const createDamageSchema = z.object({
    note: z.string().optional().nullable(),

    reason: z.enum(["expired", "manual"]).default("manual"),

    DamageDate: z.coerce.date(),

    items: z
        .array(damageItemSchema)
        .min(1, "At least one damaged item is required"),
});

