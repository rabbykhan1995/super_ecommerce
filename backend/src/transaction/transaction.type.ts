import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createTransactionSchema } from "./transaction.validator";

export const TRANSACTION_TYPES = [
  "sale", "purchase", "sale_return", "purchase_return",
  "transfer", "deposit", "withdraw", "expense", "salary", "exchange"
] as const;

export const Transaction_TYPE_MODELS = ["Sale", "Purchase", "SaleReturn", "PurchaseReturn", "Expense", "Exchange"] as const;

// Exchange means taka ferot.

export interface ITransaction extends Document {
  type: typeof TRANSACTION_TYPES[number];
  amount?: number;
  fromAccount?: Types.ObjectId;
  typeID?: Types.ObjectId;
  groupID?:Types.ObjectId;
  contactID?: Types.ObjectId;
  typeModel?: typeof Transaction_TYPE_MODELS[number];
  toAccount?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  note?: string;
  date?: Date;
  status: "pending" | "completed" | "failed";
}

export type TransactionResponse = HydratedDocument<ITransaction>;

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
