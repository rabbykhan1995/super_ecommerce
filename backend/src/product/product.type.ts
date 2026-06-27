import z from "zod";
import { createProductSchema, updateProductSchema } from "./product.validator";
import { productTable } from "./product.table";
import { batchTable } from "./batch.table";

export type Product = typeof productTable.$inferSelect; 

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type Batch = typeof batchTable.$inferSelect;