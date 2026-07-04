import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { transactionTable } from "../transaction/transaction.table";
/* ===========================
   Expenses
=========================== */

export const expenseTable = pgTable("expenses", {
  id: serial("id").primaryKey(),

  expenseTypeID: integer("expense_type_id")
    .notNull()
    .references(() => expenseTypeTable.id),

  paid: integer("paid").default(0).notNull(),

  exchangeAmount:integer("exchange_amount").default(0).notNull(),

  note: varchar("note", { length: 1000 }),

  documentImage: varchar("document_image", {
    length: 500,
  }),

  expenseDate: timestamp("expense_date", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const expenseTypeTable = pgTable("expense_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});


export const expenseRelations = relations(
  expenseTable,
  ({ one, many }) => ({
    expenseType: one(expenseTypeTable, {
      fields: [expenseTable.expenseTypeID],
      references: [expenseTypeTable.id],
    }),

    transactions: many(transactionTable),
  }),
);

export const expenseTypeRelations = relations(
  expenseTypeTable,
  ({ many }) => ({
    expenses: many(expenseTable),
  }),
);