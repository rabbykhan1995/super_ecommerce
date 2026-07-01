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
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contactTable } from "../contact/contact.table";
import { batchTable } from "../product/batch.table";
import { ledgerTable } from "../ledger/ledger.table";
import { transactionTable } from "../transaction/transaction.table";
// আপনার প্রোজেক্টের পাথ অনুযায়ী নিচের ইম্পোর্টগুলো ঠিক করে নেবেন


export const purchaseTable = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),

    purchaseDate: timestamp("purchase_date", { withTimezone: true })
      .defaultNow()
      .notNull(),

    invoiceNo: varchar("invoice_no", { length: 100 }).unique(),

    // mongoose-এর supplierID এখানে contactID এবং contactTable-কে রেফার করবে
    supplierID: integer("supplier_id")
      .notNull()
      .references(() => contactTable.id),

    note: text("note"),

    costName: varchar("cost_name", { length: 255 }),

    deletable: boolean("deletable").default(true).notNull(),

    // ডেসিমেল সংখ্যার জন্য numeric টাইপ ব্যবহার করা বেস্ট (Precision, Scale)
    totalProductPrice: numeric("total_product_price", { precision: 12, scale: 2 , mode:"number"}).default(0).notNull(),
    otherCost: numeric("other_cost", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),
    discount: numeric("discount", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),
    paid: numeric("paid", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),
    // Snapshots
    exchangeAmount: numeric("exchange_amount", { precision: 12, scale: 2 , mode:"number"}).default(0).notNull(),
    balanceBefore: numeric("balance_before", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),
    balanceAfter: numeric("balance_after", { precision: 12, scale: 2, mode:"number" }).default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("purchases_supplier_id_idx").on(table.supplierID),
    index("purchases_invoice_no_idx").on(table.invoiceNo),
  ]
);

// পারচেজ টেবিলের রিলেশন
export const purchaseRelations = relations(purchaseTable, ({ one,many }) => ({
  supplier: one(contactTable, {
    fields: [purchaseTable.supplierID],
    references: [contactTable.id],
  }),

  batches:many(batchTable),
  ledgers:one(ledgerTable),
  transactions:many(transactionTable),
}));