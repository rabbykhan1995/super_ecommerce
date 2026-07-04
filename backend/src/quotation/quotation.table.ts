import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { contactTable } from "../contact/contact.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";

/* ===========================
   Sale Quotations
=========================== */

export const saleQuotationTable = pgTable("sale_quotations", {
  id: serial("id").primaryKey(),

  saleDate: timestamp("sale_date", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  status: varchar("status", {
    length: 20,
    enum: ["pending", "approved", "cancelled"],
  })
    .default("pending")
    .notNull(),

  customerID: integer("customer_id").references(() => contactTable.id, {
    onDelete: "set null",
  }),

  note: varchar("note", {
    length: 1000,
  }),

  costName: varchar("cost_name", {
    length: 255,
  }),

  deletable: boolean("deletable")
    .default(true)
    .notNull(),

  totalProductPrice: integer("total_product_price")
    .default(0)
    .notNull(),

  otherCost: integer("other_cost")
    .default(0)
    .notNull(),

  discount: integer("discount")
    .default(0)
    .notNull(),

  balanceBefore: integer("balance_before")
    .default(0)
    .notNull(),

  balanceAfter: integer("balance_after")
    .default(0)
    .notNull(),

  totalAmount: integer("total_amount")
    .default(0)
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
});

/* ===========================
   Sale Quotation Products
=========================== */

export const saleQuotationItemsTable = pgTable(
  "sale_quotation_items",
  {
    id: serial("id").primaryKey(),

    quotationId: integer("quotation_id")
      .notNull()
      .references(() => saleQuotationTable.id, {
        onDelete: "cascade",
      }),

    productId: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    batchId: integer("batch_id").references(() => batchTable.id, {
      onDelete: "set null",
    }),

    soldQty: integer("sold_qty")
      .default(0)
      .notNull(),

    salePrice: integer("sale_price")
      .default(0)
      .notNull(),

    warranty: integer("warranty")
      .default(0)
      .notNull(),
  },
);

/* ===========================
   Relations
=========================== */

export const saleQuotationRelations = relations(
  saleQuotationTable,
  ({ one, many }) => ({
    customer: one(contactTable, {
      fields: [saleQuotationTable.customerId],
      references: [contactTable.id],
    }),

    items: many(saleQuotationItemsTable),
  }),
);

export const saleQuotationProductRelations = relations(
  saleQuotationItemsTable,
  ({ one }) => ({
    quotation: one(saleQuotationTable, {
      fields: [saleQuotationItemsTable.quotationId],
      references: [saleQuotationTable.id],
    }),

    product: one(productTable, {
      fields: [saleQuotationItemsTable.productId],
      references: [productTable.id],
    }),

    batch: one(batchTable, {
      fields: [saleQuotationItemsTable.batchId],
      references: [batchTable.id],
    }),
  }),
);