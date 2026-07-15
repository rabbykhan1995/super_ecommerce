import { z } from "zod";
import { paymentAccountSchema } from "./sale.validator";

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
  exchangeAmount: z.number().default(0),
  exchangeAccounts: paymentAccountSchema.default([]),
});