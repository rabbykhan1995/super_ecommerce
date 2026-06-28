import z from "zod";
import { createProductSchema, updateProductSchema } from "./product.validator";
import { productTable } from "./product.table";
import { batchTable } from "./batch.table";
import { variantTable } from "./variant.table";
import { variantAttributes } from "./attribute.table";

export type Product = typeof productTable.$inferSelect;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Batch = typeof batchTable.$inferSelect;

export type BatchPayload = Omit<typeof batchTable.$inferInsert, "id" | "createAt" | "updateAt" | "">;
export type ProductPayload = Omit<
    typeof productTable.$inferInsert,
    "id" | "createdAt" | "updatedAt"
>;

export type Variant = typeof variantTable.$inferSelect;

export type VariantPayload = Omit<
    typeof variantTable.$inferInsert,
    "id" | "createdAt" | "updatedAt"
>;

export type VariantAttribute = typeof variantAttributes.$inferSelect;

export type VariantAttributePayload = Omit<
    VariantAttribute,
    "id"
>;