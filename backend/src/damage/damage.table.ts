import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { productTable } from "../product/product.table";
import { purchaseTable } from "../purchase/purchase.table";
import { batchTable } from "../product/batch.table";
import { variantTable } from "../product/variant.table";

export const damageTable = pgTable(
  "damages",
  {
    id: serial("id").primaryKey(),

    batchID: integer("batch_id").references(() => batchTable.id, {
      onDelete: "set null",
    }),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id),

    purchaseID: integer("purchase_id").references(() => purchaseTable.id, {
      onDelete: "set null",
    }),

    serial: varchar("serial", {
      length: 255,
    }),

    expireDate: timestamp("expire_date", {
      withTimezone: true,
    }),

    damagedQty: integer("damaged_qty").notNull(),

    damageLoss: integer("damage_loss").default(0).notNull(),

    purchasePrice: integer("purchase_price").notNull(),

    reason: varchar("reason", {
      length: 20,
      enum: ["expired", "manual"],
    })
      .default("manual")
      .notNull(),

    note: text("note"),

    damageDate: timestamp("damage_date", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletable: boolean("deletable")
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
    index("damage_product_idx").on(table.productID),
    index("damage_batch_idx").on(table.batchID),
    index("damage_purchase_idx").on(table.purchaseID),
    index("damage_date_idx").on(table.damageDate),
  ],
);

export const damageRelations = relations(
  damageTable,
  ({ one,many }) => ({
    batch: one(batchTable, {
      fields: [damageTable.batchID],
      references: [batchTable.id],
    }),

    product: one(productTable, {
      fields: [damageTable.productID],
      references: [productTable.id],
    }),

    variant: one(variantTable, {
      fields: [damageTable.variantID],
      references: [variantTable.id],
    }),

    purchase: one(purchaseTable, {
      fields: [damageTable.purchaseID],
      references: [purchaseTable.id],
    }),
    stockFlows:many(damageTable),
  }),
);