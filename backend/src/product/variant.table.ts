import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
  numeric,
  index,
  pgSequence,
  jsonb,
} from "drizzle-orm/pg-core";
import { productTable } from "./product.table";
import { relations, sql } from "drizzle-orm";
import { batchTable } from "./batch.table";
import { saleItemsTable } from "../sale/sale_items.table";

export const variantBarcodeSeq = pgSequence("variant_barcode_seq", {
  startWith: 100001,
  increment: 1,
});


export const variantTable = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),

    productID: integer("product_id").notNull().references(() => productTable.id),

    salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2  }).default(0),
    stock:numeric("stock", { mode: "number", precision: 12, scale: 2}).default(0),
    barcode: varchar("barcode", { length: 50 })
      .default(sql`'VAR-' || nextval('variant_barcode_seq')`)
      .notNull()
      .unique(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // in kg
    weight: numeric("weight", { mode: "number", precision: 12, scale: 4 }).default(0),

    attributes: jsonb("attributes")
      .$type<{ name: string; value: string }[]>()
      .notNull()
      .default(sql`'[{"name":"base","value":"none"}]'::jsonb`),

    images: jsonb("images")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

  },
  (table) => [index("variants_product_id_idx").on(table.productID)],
);


export const variantRelations = relations(variantTable, ({ one, many }) => ({
  product: one(productTable, {
    fields: [variantTable.productID],
    references: [productTable.id],
  }),
  batches: many(batchTable),
  saleItems:many(saleItemsTable)
}));


