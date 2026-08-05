import { z } from "zod";

export const createTransactionSchema = z.object({
  accountID: z.number({ required_error: "Account ID is required" }),
  amount: z.number().positive("Amount must be greater than 0"),
  source: z.enum([
    "purchase",
    "purchase_return",
    "sale",
    "sale_return",
    "expense",
    "warranty",
    "balance_transfer",
    "deposit",
    "withdraw",
    "payment",
  ]),
  type: z.enum(["credit", "debit"]),
  date: z.coerce.date().default(() => new Date()),
  purchaseID: z.number().optional(),
  saleID: z.number().optional(),
  purchaseReturnID: z.number().optional(),
  saleReturnID: z.number().optional(),
  balanceTransferID: z.number().optional(),
  warrantyID: z.number().optional(),
  expenseID: z.number().optional(),
  paymentID: z.number().optional(),
});

