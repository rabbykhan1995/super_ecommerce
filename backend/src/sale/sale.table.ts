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
import { productTable } from "../product/product.table";
import { batchTable } from "../product/batch.table";
import { transactionTable } from "../transaction/transaction.table";

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

// --- ২. সেলস আইটেম/প্রোডাক্টস টেবিল (Mongoose products array-এর বিকল্প) ---
export const saleItemsTable = pgTable(
  "sale_items",
  {
    id: serial("id").primaryKey(),

    saleID: integer("sale_id")
      .notNull()
      .references(() => saleTable.id, { onDelete: "cascade" }),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id),

    batchID: integer("batch_id")
      .notNull()
      .references(() => batchTable.id),

    soldQty: numeric("sold_qty", { precision: 10, scale: 2 }).default("0").notNull(),
    salePrice: numeric("sale_price", { precision: 12, scale: 2 }).default("0").notNull(),
    
    warranty: integer("warranty").default(0).notNull(), // ওয়ারেন্টি মাস/দিন ট্র্যাকিংয়ের জন্য
  },
  (table) => [
    index("sale_items_sale_id_idx").on(table.saleID),
    index("sale_items_product_id_idx").on(table.productID),
    index("sale_items_batch_id_idx").on(table.batchID),
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
}));

// সেলস আইটেম টেবিলের রিলেশন
export const saleItemsRelations = relations(saleItemsTable, ({ one }) => ({
  sale: one(saleTable, {
    fields: [saleItemsTable.saleID],
    references: [saleTable.id],
  }),
  product: one(productTable, {
    fields: [saleItemsTable.productID],
    references: [productTable.id],
  }),
  batch: one(batchTable, {
    fields: [saleItemsTable.batchID],
    references: [batchTable.id],
  }),
}));