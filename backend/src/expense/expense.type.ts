import { expenseTable, expenseTypeTable } from "./expense.table";

export type Expense = typeof expenseTable.$inferSelect;

export type ExpenseType = typeof expenseTypeTable.$inferSelect;

export type ExpensePayload = typeof expenseTable.$inferInsert;

export type ExpenseTypePayload = typeof expenseTypeTable.$inferInsert;

