import {
  pgTable,
  timestamp,
  serial,
  boolean,
  integer,
  numeric,
  index,
  varchar,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { productTable } from "./product.table";
import { variantTable } from "./variant.table";
import { relations } from "drizzle-orm";
import { purchaseTable } from "../purchase/purchase.table";
import { stockFlowTable } from "./stock_flow.table";
import { purchaseReturnItemsTable } from "../purchase_return/purchase_return.table";

export const batchTable = pgTable(
  "batches",
  {
    id: serial("id").primaryKey(),

    serial: varchar("serial").unique(),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id, {
        onDelete: "cascade",
      }),

    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id),

    purchaseID: integer("purchase_id").references(
      () => purchaseTable.id, { onDelete: "cascade" }
    ),

    // Purchase snapshot
    cost: numeric("cost", {
      precision: 12,
      scale: 2,
      mode: "number"
    })
      .default(0)
      .notNull(),

    warranty: integer("warranty")
      .default(0)
      .notNull(),


    purchasedQty: numeric("purchased_qty", {
      precision: 12,
      scale: 2,
      mode: "number"
    })
      .default(0)
      .notNull(),

    // Current stock (cache)
    remainingQty: numeric("remaining_qty", {
      precision: 12,
      scale: 2,
      mode: "number"
    })
      .default(0)
      .notNull(),

    purchaseDate: timestamp("purchase_date", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    expireDate: timestamp("expire_date", {
      withTimezone: true,
    }).$type<Date | null>(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

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
  },
  (table) => [
    index("batches_product_idx").on(table.productID),
    index("batches_variant_idx").on(table.variantID),
    index("batches_purchase_idx").on(table.purchaseID),
    check("batches_warranty_check", sql`${table.warranty} >= 0`),
  ]
);


export const batchRelations = relations(batchTable, ({ one, many }) => ({
  product: one(productTable, {
    fields: [batchTable.productID],
    references: [productTable.id],
  }),
  variant: one(variantTable, {
    fields: [batchTable.variantID],
    references: [variantTable.id],
  }),

  purchase: one(purchaseTable, {
    fields: [batchTable.purchaseID],
    references: [purchaseTable.id],
  }),
  stockFlows: many(stockFlowTable),

  purchaseReturnItems: many(purchaseReturnItemsTable),
}));