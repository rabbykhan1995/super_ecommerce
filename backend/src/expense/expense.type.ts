import z from "zod";
import { expenseTable, expenseTypeTable } from "./expense.table";
import { createExpenseSchema } from "./expense.validator";

export type Expense = typeof expenseTable.$inferSelect;

export type ExpenseType = typeof expenseTypeTable.$inferSelect;

export type ExpensePayload = typeof expenseTable.$inferInsert;

export type ExpenseTypePayload = typeof expenseTypeTable.$inferInsert;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;