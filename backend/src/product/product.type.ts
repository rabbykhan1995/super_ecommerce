import z from "zod";
import { createProductSchema, updateProductSchema } from "./product.validator";
import { productTable } from "./product.table";
import { batchTable } from "./batch.table";
import { variantTable } from "./variant.table";
import { stockFlowTable } from "./stock_flow.table";


export type Product = typeof productTable.$inferSelect;

export type ProductPayload = typeof productTable.$inferInsert;

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type Batch = typeof batchTable.$inferSelect;

export type BatchPayload = Omit<typeof batchTable.$inferInsert, "id" | "createAt" | "updateAt" | "">;


export type Variant = typeof variantTable.$inferSelect;


export type VariantPayload =typeof variantTable.$inferInsert;

export type stockFlow = typeof stockFlowTable.$inferSelect;

export type stockFlowPayload = typeof stockFlowTable.$inferInsert;