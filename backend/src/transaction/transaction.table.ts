import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  varchar,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { purchaseTable } from "../purchase/purchase.table";
import { purchaseReturnTable } from "../purchase_return/purchase_return.table";
import { saleTable } from "../sale/sale.table";
import { saleReturnTable } from "../sale_return/sale_return.table";

// ১. ট্রানজেকশনের সোর্স মডিউল (কিসের মাধ্যমে জেনারেট হলো)
export const txSourceEnum = pgEnum("tx_source", [
  "purchase",
  "purchase_return",
  "sale",
  "sale_return",
  "expense",
  "warranty",
  "balance_transfer",
  "deposit",
  "withdraw"
]);

export const txTypeEnum = pgEnum("tx_type", ["credit", "debit"]);

export const transactionTable = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),

    txNo: varchar("tx_no", { length: 100 }).notNull().unique(),

    accountID: integer("account_id").notNull(), // কোন একাউন্ট (ক্যাশ বক্স, ব্যাংক, ইত্যাদি)

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    source: txSourceEnum("source").notNull(),           // e.g., 'purchase', 'sale'

    type:txTypeEnum("type").default("credit").notNull(),

    purchaseID:integer("purchase_id"),

    saleID:integer("sale_id"),

    purchaseReturnID:integer("purchase_return_id"),

    saleReturnID:integer("sale_return_id"),

    balanceTransferID:integer("balance_transfer_id"),

    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),

  },
  (table) => [
    index("transactions_account_idx").on(table.accountID),
    index("transactions_purchase_id_idx").on(table.purchaseID),
    index("transactions_purchase_return_id_idx").on(table.purchaseReturnID),
    index("transactions_sale_id_idx").on(table.saleID),
    index("transactions_sale_return_id_idx").on(table.saleReturnID),
  ]
);

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  purchase: one(purchaseTable, {
    fields: [transactionTable.purchaseID],
    references: [purchaseTable.id],
  }),
  purchaseReturn: one(purchaseReturnTable, {
    fields: [transactionTable.purchaseReturnID],
    references: [purchaseReturnTable.id],
  }),
  sale: one(saleTable, {
    fields: [transactionTable.saleID],
    references: [saleTable.id],
  }),
  saleReturn: one(saleReturnTable, {
    fields: [transactionTable.saleReturnID],
    references: [saleReturnTable.id],
  }),
}));