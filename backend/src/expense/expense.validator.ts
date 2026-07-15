import { z } from "zod";
import { paymentAccountSchema } from "../account/account.validator";

export const createExpenseSchema = z.object({
  note: z.string().optional(),
  expenseTypeID: z.number().min(1, { message: "Expense Type is required" }),
  manageWarranty: z.boolean().default(false),
  documentImage: z.string().nullable().optional(),
  paid: z.number("must be number").default(0),
  expenseDate: z
    .coerce
    .date({ message: "Expense date must be a valid date" }),
  accounts: paymentAccountSchema,
  exchangeAmount:z.number("must be number").default(0),
  exchangeAccounts: paymentAccountSchema.default([]),
});


export const createExpenseTypeSchema = z.object({
  name: z.string().min(3,"must be 3 letters"),
});