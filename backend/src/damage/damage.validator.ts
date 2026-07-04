import { z } from "zod";

const damageItemSchema = z.object({
  batchID: z.number().int().positive().optional().nullable(),

  purchaseID: z.number().int().positive().optional().nullable(),

  productID: z.number().int().positive(),

  variantID: z.number().int().positive(),

  serial: z.string().optional().nullable(),

  expireDate: z.coerce.date().optional().nullable(),

  damagedQty: z
    .number({
      message: "Damaged quantity must be a number",
    })
    .int()
    .min(1, "Damaged quantity must be at least 1"),

  purchasePrice: z
    .number({
      message: "Purchase price must be a number",
    })
    .min(0),

  damageLoss: z
    .number({
      message: "Damage loss must be a number",
    })
    .min(0)
    .default(0),
});

export const createDamageSchema = z.object({
  note: z.string().optional().nullable(),

  reason: z.enum(["expired", "manual"]).default("manual"),

  damageDate: z.coerce.date().optional().default(new Date()),

  items: z
    .array(damageItemSchema)
    .min(1, "At least one damaged item is required"),
});

export type CreateDamageInput = z.infer<typeof createDamageSchema>;