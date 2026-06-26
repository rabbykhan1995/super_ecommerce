import {
  pgTable,
  timestamp,
  serial,
  boolean,
  integer,
  numeric,
  varchar,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// আপনার প্রোজেক্টের পাথ অনুযায়ী ইমপোর্টগুলো চেক করে নেবেন
import { contactTable } from "../contact/contact.table";
import { transactionTable } from "../transaction/transaction.table";
import { ledgerTable } from "../ledger/ledger.table";
import { saleItemsTable } from "./sale_items.table";

// --- ১. মূল সেলস টেবিল ---
export const saleTable = pgTable(
  "sales",
  {
    id: serial("id").primaryKey(),

    saleDate: timestamp("sale_date", { withTimezone: true })
      .defaultNow()
      .notNull(),

    invoiceNo: varchar("invoice_no", { length: 100 }).unique(),

    // customerID (nullable হতে পারে ওয়াকিং কাস্টমারের জন্য, তাই .notNull() দেওয়া হয়নি)
    customerID: integer("customer_id").references(() => contactTable.id),

    note: text("note"),

    costName: varchar("cost_name", { length: 255 }),

    deletable: boolean("deletable").default(true).notNull(),

    // ফাইনান্সিয়াল হিসাবের জন্য numeric টাইপ
    totalProductPrice: numeric("total_product_price", { precision: 12, scale: 2 }).default("0").notNull(),
    otherCost: numeric("other_cost", { precision: 12, scale: 2 }).default("0").notNull(),
    discount: numeric("discount", { precision: 12, scale: 2 }).default("0").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    paid: numeric("paid", { precision: 12, scale: 2 }).default("0").notNull(),

    // Snapshots
    exchangeAmount: numeric("exchange_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    balanceBefore: numeric("balance_before", { precision: 12, scale: 2 }).default("0").notNull(),
    balanceAfter: numeric("balance_after", { precision: 12, scale: 2 }).default("0").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sales_customer_id_idx").on(table.customerID),
    index("sales_invoice_no_idx").on(table.invoiceNo),
  ]
);




export const saleRelations = relations(saleTable, ({ one, many }) => ({
  customer: one(contactTable, {
    fields: [saleTable.customerID],
    references: [contactTable.id],
  }),
  // ১টি সেলের আন্ডারে অনেক প্রোডাক্ট থাকতে পারে
  items: many(saleItemsTable),
  // ১টি সেলের আন্ডারে অনেক পেমেন্ট/এক্সচেঞ্জ ট্রানজেকশন থাকতে পারে (সেন্ট্রাল টেবিল থেকে)
  transactions: many(transactionTable),
  ledgers: one(ledgerTable),
}));

// সেলস আইটেম টেবিলের রিলেশন
