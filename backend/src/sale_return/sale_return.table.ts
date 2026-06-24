import {
  pgTable,
  timestamp,
  serial,
  integer,
  numeric,
  text,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { contactTable } from "../contact/contact.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { saleTable } from "../sale/sale.table";
import { transactionTable } from "../transaction/transaction.table";
import { ledgerTable } from "../ledger/ledger.table";


// --- ১. মূল সেলস রিটার্ন টেবিল ---
export const saleReturnTable = pgTable(
  "sale_returns",
  {
    id: serial("id").primaryKey(),

    saleID: integer("sale_id")
      .notNull()
      .references(() => saleTable.id),

    // customerID (nullable হতে পারে ওয়াকিং কাস্টমারের জন্য)
    customerID: integer("customer_id").references(() => contactTable.id),

    note: text("note"),

    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    paid: numeric("paid", { precision: 12, scale: 2 }).default("0").notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),

    // Snapshots
    balanceBefore: numeric("balance_before", { precision: 12, scale: 2 }).default("0").notNull(),
    balanceAfter: numeric("balance_after", { precision: 12, scale: 2 }).default("0").notNull(),

    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sale_returns_sale_id_idx").on(table.saleID),
    // কম্পাউন্ড ইনডেক্স (customerID এবং date একসাথে ফিল্টারিং ও শর্টিং ফাস্ট করার জন্য)
    index("sale_returns_customer_date_idx").on(table.customerID, table.date),
  ]
);

// --- ২. সেলস রিটার্ন আইটেম টেবিল (Mongoose batches array-এর বিকল্প) ---
export const saleReturnItemsTable = pgTable(
  "sale_return_items",
  {
    id: serial("id").primaryKey(),

    saleReturnID: integer("sale_return_id")
      .notNull()
      .references(() => saleReturnTable.id, { onDelete: "cascade" }),

    batchID: integer("batch_id")
      .notNull()
      .references(() => batchTable.id),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    saleReturnedQty: numeric("sale_returned_qty", { precision: 10, scale: 2 }).default("0").notNull(),
    salePrice: numeric("sale_price", { precision: 12, scale: 2 }).default("0").notNull(),
    reason: text("reason"),
  },
  (table) => [
    index("sr_items_return_id_idx").on(table.saleReturnID),
    index("sr_items_batch_id_idx").on(table.batchID),
  ]
);


export const saleReturnRelations = relations(saleReturnTable, ({ one, many }) => ({
  sale: one(saleTable, {
    fields: [saleReturnTable.saleID],
    references: [saleTable.id],
  }),
  customer: one(contactTable, {
    fields: [saleReturnTable.customerID],
    references: [contactTable.id],
  }),
  // রিটার্নের ভেতরের আইটেমসমূহ
  items: many(saleReturnItemsTable),
  // সেন্ট্রাল টেবিল থেকে আসা এই রিটার্নের ফিন্যান্সিয়াল ট্রানজেকশনসমূহ
  transactions: many(transactionTable),
  ledger: one(ledgerTable),
}));

// সেলস রিটার্ন আইটেম টেবিলের রিলেশন
export const saleReturnItemsRelations = relations(saleReturnItemsTable, ({ one }) => ({
  saleReturn: one(saleReturnTable, {
    fields: [saleReturnItemsTable.saleReturnID],
    references: [saleReturnTable.id],
  }),
  batch: one(batchTable, {
    fields: [saleReturnItemsTable.batchID],
    references: [batchTable.id],
  }),
  product: one(productTable, {
    fields: [saleReturnItemsTable.productID],
    references: [productTable.id],
  }),
  
}));