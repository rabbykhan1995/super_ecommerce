import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createLedgerSchema, updateLedgerSchema } from "./ledger.validator";

export interface ILedger extends Document {
  type: "sale" | "purchase" | "payment_in" | "payment_out" | "sale_return" | "purchase_return";
  typeID: Types.ObjectId;
  typeModel: "Sale" | "Purchase" | "Transaction";
  contactID: Types.ObjectId;
  contactType: "customer" | "supplier";
  amount: number;
  discount?: number;
  paidAmount?: number;
  dueAmount?: number;
  balanceAfter?: number;
  balanceBefore?: number;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LedgerResponse = HydratedDocument<ILedger>;

export type CreateLedgerInput = {
  type:
  | "sale"
  | "purchase"
  | "payment_in"
  | "payment_out"
  | "sale_return"
  | "purchase_return";

  typeID?: Types.ObjectId;

  typeModel?: "Sale" | "Purchase" | "Transaction";

  contactID: Types.ObjectId;

  contactType: "customer" | "supplier";

  amount: number;

  discount?: number;

  paidAmount?: number;

  dueAmount?: number;

  balanceAfter?: number;

  balanceBefore?: number;

  note?: string;

  date?: Date;
};
export type UpdateLedgerInput = z.infer<typeof updateLedgerSchema>;


export type AllLedgerResponse = LedgerResponse[];