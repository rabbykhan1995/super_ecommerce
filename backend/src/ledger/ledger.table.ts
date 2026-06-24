import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
  varchar,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// আপনার প্রোজেক্টের পাথ অনুযায়ী ইমপোর্টগুলো চেক করে নেবেন

import { saleTable } from "../sale/sale.table";
import { purchaseTable } from "../purchase/purchase.table";
import { saleReturnTable } from "../sale_return/sale_return.table";
import { purchaseReturnTable } from "../purchase_return/purchase_return.table";
import { transactionTable } from "../transaction/transaction.table";
import { contactTable } from "../contact/contact.table";

// ১. লেজার এন্ট্রির টাইপ এনাম
export const ledgerTypeEnum = pgEnum("ledger_type", [
  "sale",
  "purchase",
  "payment_in",
  "payment_out",
  "sale_return",
  "purchase_return",
]);

export const ledgerTable = pgTable(
  "ledgers",
  {
    id: serial("id").primaryKey(),

    type: ledgerTypeEnum("type").notNull(),

    // ২. এক্সপ্লিসিট অপশনাল ফরেন কি-সমূহ (মঙ্গুসের typeID ও refPath এর পরিবর্তে)
    saleID: integer("sale_id").references(() => saleTable.id, { onDelete: "cascade" }),
    purchaseID: integer("purchase_id").references(() => purchaseTable.id, { onDelete: "cascade" }),
    saleReturnID: integer("sale_return_id").references(() => saleReturnTable.id, { onDelete: "cascade" }),
    purchaseReturnID: integer("purchase_return_id").references(() => purchaseReturnTable.id, { onDelete: "cascade" }),
    // payment_in বা payment_out হলে সেটি আপনার transactionTable কে রেফার করবে
    transactionID: integer("transaction_id").references(() => transactionTable.id, { onDelete: "cascade" }),
    // ৩. কোন কাস্টমার বা সাপ্লায়ারের লেজার
    contactID: integer("contact_id")
      .notNull()
      .references(() => contactTable.id),
    // ৪. ফাইনান্সিয়াল ক্যালকুলেশনের জন্য numeric টাইপ
    amount: numeric("amount", { precision: 12, scale: 2 }).default("0").notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    dueAmount: numeric("due_amount", { precision: 12, scale: 2 }).default("0").notNull(),

    // Snapshots (ব্যালেন্স মেলানোর জন্য)
    balanceBefore: numeric("balance_before", { precision: 12, scale: 2 }).default("0").notNull(),
    balanceAfter: numeric("balance_after", { precision: 12, scale: 2 }).default("0").notNull(),

    note: text("note"),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // মঙ্গুসের প্রথম ইন্ডেক্স: কন্টাক্ট ধরে ডেট ওয়াইজ স্টেটমেন্ট খোঁজা (খুবই ইম্পর্টেন্ট)
    index("ledgers_contact_date_idx").on(table.contactID, table.date),

    // মঙ্গুসের দ্বিতীয় ইন্ডেক্স: নির্দিষ্ট কোনো সেল/পারচেজের লেজার খোঁজা
    index("ledgers_sale_id_idx").on(table.saleID),
    index("ledgers_purchase_id_idx").on(table.purchaseID),
    index("ledgers_transaction_id_idx").on(table.transactionID),
  ]
);

export const ledgerRelations = relations(ledgerTable, ({ one }) => ({
  contact: one(contactTable, {
    fields: [ledgerTable.contactID],
    references: [contactTable.id],
  }),
  sale: one(saleTable, {
    fields: [ledgerTable.saleID],
    references: [saleTable.id],
  }),
  purchase: one(purchaseTable, {
    fields: [ledgerTable.purchaseID],
    references: [purchaseTable.id],
  }),
  saleReturn: one(saleReturnTable, {
    fields: [ledgerTable.saleReturnID],
    references: [saleReturnTable.id],
  }),
  purchaseReturn: one(purchaseReturnTable, {
    fields: [ledgerTable.purchaseReturnID],
    references: [purchaseReturnTable.id],
  }),
  transaction: one(transactionTable, {
    fields: [ledgerTable.transactionID],
    references: [transactionTable.id],
  }),
}));