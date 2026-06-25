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
import { accountTable } from "./account.table";
import { transactionTable } from "../transaction/transaction.table";
 
export const balanceTransferTable = pgTable(
    "balance_transfer",
    {
        id: serial("id").primaryKey(),

        fromAccountID: integer("from_account_id").notNull().references(() => accountTable.id), // কোন একাউন্ট (ক্যাশ বক্স, ব্যাংক, ইত্যাদি)

        toAccountID: integer("to_account_id").notNull().references(() => accountTable.id),
        
        amount:numeric("amount", { precision: 20, scale: 2 }).notNull(),

        date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),

    },
    (table) => [
        index("balance_transfer_from_account_idx").on(table.fromAccountID),
        index("balance_transfer_to_account_idx").on(table.toAccountID),
    ]
);

export const balanceTransferRelations = relations(balanceTransferTable, ({ one,many }) => ({
    fromAccount: one(accountTable, {
        fields: [balanceTransferTable.fromAccountID],
        references: [accountTable.id],
    }),
    toAccount: one(accountTable, {
        fields: [balanceTransferTable.toAccountID],
        references: [accountTable.id],
    }),
    transaction:many(transactionTable)
}));