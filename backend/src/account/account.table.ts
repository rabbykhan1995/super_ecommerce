import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { transactionTable } from "../transaction/transaction.table";
import { balanceTransferTable } from "./balance_transfer.table";

export const accountTable = pgTable("accounts", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  branch: varchar("branch", { length: 100 }).default(""),

  balance: numeric("balance")
    .notNull()
    .default("0"),

  number: varchar("number", { length: 50 }).notNull(),

  isDefault: boolean("is_default").notNull().default(false),
});

export const accountRelations = relations(accountTable, ({ one,many }) => ({
    transactions:many(transactionTable),
    balanceTransfers:many(balanceTransferTable),
}));