import { z } from "zod";
import { Types } from "mongoose";
import { Transaction_TYPE_MODELS, TRANSACTION_TYPES } from "./transaction.type";

export const createTransactionSchema = z.object({
  date: z.coerce.date().default(() => new Date()),

  accounts: z.array(
    z.object({
      accountID: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "invalid accountID",
      }),
      amount: z.number().positive("amount must be greater than 0"),
    })
  ).optional(),

  transaction: z.object({
    contactID: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "invalid contactID",
    }),
    balanceBefore: z.number().optional(),
    balanceAfter: z.number().optional(),
    amount: z.number().positive().optional(),
    note: z.string().nullable().optional(),
    type: z.enum(["Credit", "Debit"]).optional(),
  }).optional(),
});

