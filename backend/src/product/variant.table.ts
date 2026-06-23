import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  text,
  boolean,
  integer,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { productTable } from "./product.table";
import { variantAttributes } from "./attribute.table";
import { batchTable } from "./batch.table";

export const variantTable = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),

    productID: integer("product_id").notNull(),
    
    salePrice:numeric().default("0"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    sku: varchar("sku", { length: 100 }).unique(),
  },
  (table) => [index("variants_product_id_idx").on(table.productID)],
);


export const variantRelations = relations(variantTable, ({ one, many }) => ({
  product: one(productTable, {
    fields: [variantTable.productID],
    references: [productTable.id],
  }),

  attributes: many(variantAttributes),
  batches: many(batchTable),
}));