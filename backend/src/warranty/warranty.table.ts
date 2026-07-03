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
// আপনার প্রোজেক্টের পাথ অনুযায়ী ইমপোর্ট চেক করে নেবেন
import { saleTable } from "../sale/sale.table";
import { contactTable } from "../contact/contact.table";
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { transactionTable } from "../transaction/transaction.table";


// ১. ওয়ারেন্টি স্ট্যাটাস এনাম
export const warrantyStatusEnum = pgEnum("warranty_status", [
  "sold",
  "claimed",
  "sent_to_supplier",
  "received_from_supplier",
  "repaired",
  "replaced",
  "rejected",
  "returned_to_customer",
  "refunded",
]);

// ২. সাপ্লায়ার অ্যাকশন এনাম
export const supplierActionEnum = pgEnum("supplier_action", [
  "repaired",
  "replaced",
  "rejected",
  "refunded",
]);

export const warrantyTable = pgTable(
  "warranties",
  {
    id: serial("id").primaryKey(),

    saleID: integer("sale_id")
      .notNull()
      .references(() => saleTable.id, {
      onDelete: "cascade",
    }),

    customerID: integer("customer_id").references(() => contactTable.id),

    productID: integer("product_id").notNull().references(() => productTable.id),

    batchID: integer("batch_id").notNull().references(() => batchTable.id),

    serial: varchar("serial", { length: 100 }), // প্রোডাক্টের আইএমইআই (IMEI) বা ইউনিক সিরিয়াল

    salePrice: numeric("sale_price", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),

    warrantyMonths: integer("warranty_months").default(0).notNull(), // কত মাসের ওয়ারেন্টি

    
    saleDate: timestamp("sale_date", { withTimezone: true }).notNull(),

    expireDate: timestamp("expire_date", { withTimezone: true }), // saleDate + warranty months

    status: warrantyStatusEnum("status").default("sold").notNull(),

    supplierAction: supplierActionEnum("supplier_action"),

    // --- ক্লেইম সংক্রান্ত ফিল্ডস (Claim Phase) ---
    claimDate: timestamp("claim_date", { withTimezone: true }),
    issueDescription: text("issue_description"),

    // --- সাপ্লায়ার সংক্রান্ত ফিল্ডস (Supplier Phase) ---
    supplierID: integer("supplier_id").references(() => contactTable.id), // সাপ্লায়ার ও কন্টাক্ট টেবিল এক হওয়ায় রেফারেন্স এক

    sentDate: timestamp("sent_date", { withTimezone: true }),

    receivedDate: timestamp("received_date", { withTimezone: true }),

    supplierNote: text("supplier_note"),

    // --- রিপ্লেসমেন্ট সংক্রান্ত ফিল্ডস (Replace Phase) ---
    replacedSerial: varchar("replaced_serial", { length: 100 }),

    replacedBatchID: integer("replaced_batch_id").references(() => batchTable.id),

    // --- রিফান্ড ও আদার কস্ট (Financial Phase) ---
    // accounts পার্টটি বাদ গিয়েছে, কারণ খরচ বা রিফান্ড হলে সেন্ট্রাল ট্রানজেকশনে হিট করবে
    refundAmount: numeric("refund_amount", { precision: 12, scale: 2, mode:'number' }).default(0).notNull(),

    otherCost: numeric("other_cost", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),

    warranty: numeric("warranty", { precision: 4, scale: 2, mode:'number' }).default(0).notNull(),

    resolvedDate: timestamp("resolved_date", { withTimezone: true }),

    note: text("note"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("warranties_sale_id_idx").on(table.saleID),
    index("warranties_customer_id_idx").on(table.customerID),
    index("warranties_serial_idx").on(table.serial),
    index("warranties_status_idx").on(table.status),
    index("warranties_expire_date_idx").on(table.expireDate),
  ]
);

export const warrantyRelations = relations(warrantyTable, ({ one, many }) => ({
  sale: one(saleTable, {
    fields: [warrantyTable.saleID],
    references: [saleTable.id],
  }),
  customer: one(contactTable, {
    fields: [warrantyTable.customerID],
    references: [contactTable.id],
  }),
  supplier: one(contactTable, {
    fields: [warrantyTable.supplierID],
    references: [contactTable.id],
  }),
  product: one(productTable, {
    fields: [warrantyTable.productID],
    references: [productTable.id],
  }),
  batch: one(batchTable, {
    fields: [warrantyTable.batchID],
    references: [batchTable.id],
  }),
  replacedBatch: one(batchTable, {
    fields: [warrantyTable.replacedBatchID],
    references: [batchTable.id],
  }),
  // এই ওয়ারেন্টির বিপরীতে যদি কোনো ক্যাশ রিফান্ড বা কুরিয়ার খরচ (Other Cost) হয়, তার ট্রানজেকশনসমূহ
  transactions: many(transactionTable), 
}));