import {
  pgTable,
  serial,
  varchar,
  numeric,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { purchaseTable } from "../purchase/purchase.table"; // আপনার পারচেজ টেবিল পাথ
import { purchaseReturnTable } from "../purchase_return/purchase_return.table";
import { saleTable } from "../sale/sale.table";
import { saleReturnTable } from "../sale_return/sale_return.table";
import { ledgerTable } from "../ledger/ledger.table";

// ১. টাইপের জন্য pgEnum ডিফাইন করা (Mongoose enum-এর বিকল্প)
export const contactTypeEnum = pgEnum("contact_type", ["customer", "supplier", "both"]);

export const contactTable = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 150 }).notNull(),

    email: varchar("email", { length: 150 }), // lowercase করার জন্য আপনি ইনসার্ট করার সময় .toLowerCase() করে দেবেন

    mobile: varchar("mobile", { length: 20 }).notNull(),

    // ব্যালেন্স প্লাস বা মাইনাস হতে পারে, তাই numeric ব্যবহার করা হলো
    balance: numeric("balance", { precision: 12, scale: 2 }).default("0").notNull(),

    address: text("address"),

    // কন্টাক্ট টাইপ এনাম ব্যবহার করা হলো
    type: contactTypeEnum("type").default("customer").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // মঙ্গুসের মতো ইন্ডেক্সিং
    index("contacts_name_idx").on(table.name),
    
    // কম্পাউন্ড ইন্ডেক্স (type + name একসাথে ফিল্টার ও সার্চ ফাস্ট করার জন্য)
    index("contacts_type_name_idx").on(table.type, table.name),
  ]
);

// ২. কন্টাক্ট টেবিলের সাথে পারচেজ বা অন্যান্য টেবিলের রিলেশন
export const contactRelations = relations(contactTable, ({ many }) => ({
  purchases: many(purchaseTable), // একজন সাপ্লায়ারের অনেকগুলো পারচেজ থাকতে পারে
  purchaseReturns: many(purchaseReturnTable),
  sales:many(saleTable),
  saleReturns:many(saleReturnTable),
  ledgers: many(ledgerTable),
}));