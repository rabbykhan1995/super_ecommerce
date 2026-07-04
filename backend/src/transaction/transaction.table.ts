import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { purchaseTable } from "../purchase/purchase.table";
import { purchaseReturnTable } from "../purchase_return/purchase_return.table";
import { saleTable } from "../sale/sale.table";
import { saleReturnTable } from "../sale_return/sale_return.table";
import { warrantyTable } from "../warranty/warranty.table";
import { accountTable } from "../account/account.table";
import { balanceTransferTable } from "../account/balance_transfer.table";
import { randomUUID } from "crypto";
import { expenseTable } from "../expense/expense.table";

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

    txNo: varchar("tx_no", { length: 36 })
      .$defaultFn(() => randomUUID())
      .notNull()
      .unique(),

    accountID: integer("account_id").notNull().references(() => accountTable.id), // কোন একাউন্ট (ক্যাশ বক্স, ব্যাংক, ইত্যাদি)

    amount: integer("amount").default(0),

    source: txSourceEnum("source").notNull(),           // e.g., 'purchase', 'sale'

    type: txTypeEnum("type").default("credit").notNull(),

    purchaseID: integer("purchase_id").references(() => purchaseTable.id, {
      onDelete: "cascade",
    }),

    saleID: integer("sale_id").references(() => saleTable.id, {
      onDelete: "cascade",
    }),

    purchaseReturnID: integer("purchase_return_id").references(() => purchaseReturnTable.id, {
      onDelete: "cascade",
    }),

    saleReturnID: integer("sale_return_id").references(() => saleReturnTable.id, {
      onDelete: "cascade",
    }),

    balanceTransferID: integer("balance_transfer_id").references(() => balanceTransferTable.id, {
      onDelete: "cascade",
    }),

    warrantyID: integer("warranty_id").references(() => warrantyTable.id, {
      onDelete: "cascade",
    }),
    
      expenseID: integer("expense_id").references(() => expenseTable.id, {
      onDelete: "cascade",
    }),

    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),

  },
  (table) => [
    index("transactions_account_idx").on(table.accountID),
    index("transactions_purchase_id_idx").on(table.purchaseID),
    index("transactions_purchase_return_id_idx").on(table.purchaseReturnID),
    index("transactions_sale_id_idx").on(table.saleID),
    index("transactions_sale_return_id_idx").on(table.saleReturnID),
    index("transactions_warranty_id_idx").on(table.warrantyID),
    index("transactions_expense_id_idx").on(table.expenseID),
  ]
);

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  account: one(accountTable, {
    fields: [transactionTable.accountID],
    references: [accountTable.id],
  }),
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

  warranty: one(warrantyTable, {
    fields: [transactionTable.warrantyID],
    references: [warrantyTable.id],
  }),
   expense: one(expenseTable, {
    fields: [transactionTable.expenseID],
    references: [expenseTable.id],
  }),
}));