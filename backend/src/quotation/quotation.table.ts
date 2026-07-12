import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { contactTable } from "../contact/contact.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { variantTable } from "../product/variant.table";

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

  totalProductPrice: numeric("total_product_price", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),

  otherCost: numeric("other_cost", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),

  discount: numeric("discount", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),

  balanceBefore: numeric("balance_before", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),

  balanceAfter: numeric("balance_after", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),

  totalAmount: numeric("total_amount", {
    precision: 12,
    scale: 2,
    mode: "number",
  })
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

    quotationID: integer("quotation_id")
      .notNull()
      .references(() => saleQuotationTable.id, {
        onDelete: "cascade",
      }),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id),

    batchID: integer("batch_id").references(() => batchTable.id, {
      onDelete: "set null",
    }),

    soldQty: numeric("sold_qty", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    salePrice: numeric("sale_price", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
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
      fields: [saleQuotationTable.customerID],
      references: [contactTable.id],
    }),

    items: many(saleQuotationItemsTable),
  }),
);

export const saleQuotationProductRelations = relations(
  saleQuotationItemsTable,
  ({ one }) => ({
    quotation: one(saleQuotationTable, {
      fields: [saleQuotationItemsTable.quotationID],
      references: [saleQuotationTable.id],
    }),

    product: one(productTable, {
      fields: [saleQuotationItemsTable.productID],
      references: [productTable.id],
    }),

    variant: one(variantTable, {
      fields: [saleQuotationItemsTable.variantID],
      references: [variantTable.id],
    }),

    batch: one(batchTable, {
      fields: [saleQuotationItemsTable.batchID],
      references: [batchTable.id],
    }),
  }),
);