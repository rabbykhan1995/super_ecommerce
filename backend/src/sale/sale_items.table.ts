import { index, integer, numeric, pgTable, serial } from "drizzle-orm/pg-core";
import { saleTable } from "./sale.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { relations } from "drizzle-orm";
import { variantTable } from "../product/variant.table";

// --- ২. সেলস আইটেম/প্রোডাক্টস টেবিল (Mongoose products array-এর বিকল্প) ---
export const saleItemsTable = pgTable(
  "sale_items",
  {
    id: serial("id").primaryKey(),

    saleID: integer("sale_id")
      .notNull()
      .references(() => saleTable.id, { onDelete: "cascade" }),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),
    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id),

    batchID: integer("batch_id")
      .notNull()
      .references(() => batchTable.id),

    soldQty: numeric("sold_qty", { precision: 10, scale: 2, mode: "number" }).default(0).notNull(),
    salePrice: numeric("sale_price", { precision: 12, scale: 2, mode: "number" }).default(0).notNull(),

    warranty: integer("warranty").default(0).notNull(), // ওয়ারেন্টি মাস/দিন ট্র্যাকিংয়ের জন্য
  },
  (table) => [
    index("sale_items_sale_id_idx").on(table.saleID),
    index("sale_items_product_id_idx").on(table.productID),
    index("sale_items_batch_id_idx").on(table.batchID),
  ]
);

export const saleItemsRelations = relations(saleItemsTable, ({ one }) => ({
  sale: one(saleTable, {
    fields: [saleItemsTable.saleID],
    references: [saleTable.id],
  }),
  product: one(productTable, {
    fields: [saleItemsTable.productID],
    references: [productTable.id],
  }),
  batch: one(batchTable, {
    fields: [saleItemsTable.batchID],
    references: [batchTable.id],
  }),
  variant: one(variantTable, {
    fields: [saleItemsTable.variantID],
    references: [variantTable.id],
  }),
}));