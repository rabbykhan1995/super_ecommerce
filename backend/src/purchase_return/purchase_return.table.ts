import {
  pgTable,
  timestamp,
  serial,
  integer,
  numeric,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { contactTable } from "../contact/contact.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { purchaseTable } from "../purchase/purchase.table";
import { ledgerTable } from "../ledger/ledger.table";
import { transactionTable } from "../transaction/transaction.table";

// --- ১. মূল পারচেজ রিটার্ন টেবিল ---
export const purchaseReturnTable = pgTable(
  "purchase_returns",
  {
    id: serial("id").primaryKey(),

    purchaseID: integer("purchase_id")
      .notNull()
      .references(() => purchaseTable.id),

    supplierID: integer("supplier_id")
      .notNull()
      .references(() => contactTable.id),

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
    index("purchase_returns_purchase_id_idx").on(table.purchaseID),
    // কম্পাউন্ড ইনডেক্স (supplierID এবং date একসাথে ফিল্টারিং ফাস্ট করার জন্য)
    index("purchase_returns_supplier_date_idx").on(table.supplierID, table.date),
  ]
);

// --- ২. পারচেজ রিটার্ন ব্যাচ/আইটেম টেবিল (Mongoose batches array-এর বিকল্প) ---
export const purchaseReturnItemsTable = pgTable(
  "purchase_return_items",
  {
    id: serial("id").primaryKey(),

    purchaseReturnID: integer("purchase_return_id")
      .notNull()
      .references(() => purchaseReturnTable.id, { onDelete: "cascade" }),

    batchID: integer("batch_id")
      .notNull()
      .references(() => batchTable.id),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    purchaseReturnedQty: numeric("purchase_returned_qty", { precision: 10, scale: 2 }).default("0").notNull(),
    purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).default("0").notNull(),
    reason: text("reason"),
  },
  (table) => [
    index("pr_items_return_id_idx").on(table.purchaseReturnID),
    index("pr_items_batch_id_idx").on(table.batchID),
  ]
);

// মূল রিটার্ন টেবিলের রিলেশন
export const purchaseReturnRelations = relations(purchaseReturnTable, ({ one, many }) => ({
  purchase: one(purchaseTable, {
    fields: [purchaseReturnTable.purchaseID],
    references: [purchaseTable.id],
  }),
  supplier: one(contactTable, {
    fields: [purchaseReturnTable.supplierID],
    references: [contactTable.id],
  }),
  // রিটার্নের ভেতরে অনেকগুলো আইটেম/ব্যাচ থাকতে পারে
  items: many(purchaseReturnItemsTable),
  ledgers: one(ledgerTable),
  transactions: many(transactionTable),
}));

export const purchaseReturnItemsRelations = relations(purchaseReturnItemsTable, ({ one }) => ({
  purchaseReturn: one(purchaseReturnTable, {
    fields: [purchaseReturnItemsTable.purchaseReturnID],
    references: [purchaseReturnTable.id],
  }),
  batch: one(batchTable, {
    fields: [purchaseReturnItemsTable.batchID],
    references: [batchTable.id],
  }),
  product: one(productTable, {
    fields: [purchaseReturnItemsTable.productID],
    references: [productTable.id],
  }),
}));