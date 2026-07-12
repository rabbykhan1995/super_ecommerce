import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createLedgerSchema, updateLedgerSchema } from "./ledger.validator";
import { ledgerTable } from "./ledger.table";

export type Ledger = typeof ledgerTable.$inferSelect;

export type LedgerPayload = typeof ledgerTable.$inferInsert;



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


export type AllLedgerResponse = Ledger[];